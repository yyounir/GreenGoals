import { randomBytes } from 'node:crypto'
import { GoogleGenAI } from '@google/genai'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { logger, setGlobalOptions } from 'firebase-functions/v2'

initializeApp()
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

const db = getFirestore()
const geminiApiKey = defineSecret('GEMINI_API_KEY')
const categories = ['OUTDOORS', 'AT HOME', 'COMMUNITY', 'ON THE GO', 'MINDFUL LIVING']
const groupTypes = ['Class', 'Club', 'Friends', 'Organization', 'Neighborhood']
const icons = ['sun', 'leaf', 'heart']
const colors = ['lime', 'peach', 'blue']
const challengeSchema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      category: { type: 'STRING', enum: categories },
      title: { type: 'STRING' },
      description: { type: 'STRING' },
      points: { type: 'INTEGER', enum: [50, 75, 90, 100, 120, 150] },
      duration: { type: 'STRING' },
      icon: { type: 'STRING', enum: icons },
      color: { type: 'STRING', enum: colors },
    },
    required: ['category', 'title', 'description', 'points', 'duration', 'icon', 'color'],
  },
}

function requireUid(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to continue.')
  return request.auth.uid
}

function profileFromToken(request) {
  const token = request.auth.token
  return {
    name: typeof token.name === 'string' ? token.name.slice(0, 80) : 'GreenGoals member',
    email: typeof token.email === 'string' ? token.email.slice(0, 254) : '',
    photoURL: typeof token.picture === 'string' ? token.picture.slice(0, 2048) : '',
  }
}

function memberData(profile, points = 0) {
  return {
    name: profile.name,
    photoURL: profile.photoURL,
    points,
    joinedAt: FieldValue.serverTimestamp(),
  }
}

function publicChallenge(id, challenge) {
  return {
    id,
    day: challenge.day,
    category: challenge.category,
    title: challenge.title,
    description: challenge.description,
    points: challenge.points,
    duration: challenge.duration,
    icon: challenge.icon,
    color: challenge.color,
    completed: challenge.completed,
  }
}

export const initializeUser = onCall(async request => {
  const uid = requireUid(request)
  const ref = db.doc(`users/${uid}`)
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref)
    const profile = profileFromToken(request)
    if (!snapshot.exists) {
      transaction.create(ref, {
        ...profile,
        points: 0,
        completedCount: 0,
        streakDays: 0,
        lastCompletedDay: null,
        groupId: null,
        groupName: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      return
    }
    transaction.set(ref, { ...profile, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  })
  return { ok: true }
})

export const generateChallenges = onCall({ secrets: [geminiApiKey], timeoutSeconds: 60 }, async request => {
  const uid = requireUid(request)
  const userRef = db.doc(`users/${uid}`)
  const today = new Date().toISOString().slice(0, 10)
  const lockId = randomBytes(12).toString('hex')
  const lockUntil = Timestamp.fromMillis(Date.now() + 90_000)
  const lockRef = db.doc(`users/${uid}/private/state`)
  let alreadyGenerated = false

  await db.runTransaction(async transaction => {
    const [userSnapshot, stateSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(lockRef),
    ])
    if (!userSnapshot.exists) throw new HttpsError('failed-precondition', 'Your profile is still being set up. Please try again.')
    const state = stateSnapshot.data() || {}
    if (state.generatedOn === today) {
      alreadyGenerated = true
      return
    }
    if (state.generationLockUntil?.toMillis() > Date.now()) {
      throw new HttpsError('resource-exhausted', 'Your challenges are being prepared. Please try again in a moment.')
    }
    transaction.set(lockRef, { generationLockId: lockId, generationLockUntil: lockUntil }, { merge: true })
  })

  const challengeCollection = db.collection(`users/${uid}/challenges`)
  if (alreadyGenerated) {
    const existing = await challengeCollection.where('day', '==', today).get()
    return { challenges: existing.docs.map(document => publicChallenge(document.id, document.data())) }
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() })
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Create exactly 3 distinct, practical, inclusive sustainability challenges. Each must be safe, achievable, measurable, and suitable for ordinary daily life. Avoid requiring purchases, travel, special equipment, or unverifiable claims. Return JSON only.',
      config: { responseMimeType: 'application/json', responseSchema: challengeSchema, temperature: 0.8 },
    })
    const generated = JSON.parse(result.text || 'null')
    if (!Array.isArray(generated) || generated.length !== 3) {
      throw new Error('Gemini returned an invalid challenge set.')
    }
    const expiresAt = Timestamp.fromMillis(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const challenges = generated.map((challenge, index) => {
      const normalized = {
        day: today,
        category: categories.includes(challenge.category) ? challenge.category : 'COMMUNITY',
        title: String(challenge.title).trim().slice(0, 80),
        description: String(challenge.description).trim().slice(0, 220),
        points: [50, 75, 90, 100, 120, 150].includes(challenge.points) ? challenge.points : 75,
        duration: String(challenge.duration).trim().slice(0, 30),
        icon: icons.includes(challenge.icon) ? challenge.icon : 'leaf',
        color: colors.includes(challenge.color) ? challenge.color : 'lime',
        completed: false,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt,
      }
      if (!normalized.title || !normalized.description || !normalized.duration) {
        throw new Error('Gemini returned an incomplete challenge.')
      }
      return { id: `${today}-${index + 1}`, ...normalized }
    })

    const batch = db.batch()
    for (const challenge of challenges) {
      const { id, ...data } = challenge
      batch.set(challengeCollection.doc(id), data)
    }
    batch.set(lockRef, {
      generatedOn: today,
      generationLockId: FieldValue.delete(),
      generationLockUntil: FieldValue.delete(),
    }, { merge: true })
    await batch.commit()
    return { challenges: challenges.map(({ id, ...challenge }) => publicChallenge(id, challenge)) }
  } catch (error) {
    await db.runTransaction(async transaction => {
      const stateSnapshot = await transaction.get(lockRef)
      if (stateSnapshot.data()?.generationLockId === lockId) {
        transaction.set(lockRef, {
          generationLockId: FieldValue.delete(),
          generationLockUntil: FieldValue.delete(),
        }, { merge: true })
      }
    })
    logger.error('Challenge generation failed', { uid, error })
    if (error instanceof HttpsError) throw error
    throw new HttpsError('internal', 'We could not generate challenges right now. Please try again later.')
  }
})

export const completeChallenge = onCall(async request => {
  const uid = requireUid(request)
  const challengeId = request.data?.challengeId
  if (typeof challengeId !== 'string' || !/^\d{4}-\d{2}-\d{2}-[1-3]$/.test(challengeId)) {
    throw new HttpsError('invalid-argument', 'Choose a valid challenge.')
  }

  const userRef = db.doc(`users/${uid}`)
  const challengeRef = db.doc(`users/${uid}/challenges/${challengeId}`)
  return db.runTransaction(async transaction => {
    const [userSnapshot, challengeSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(challengeRef),
    ])
    if (!userSnapshot.exists || !challengeSnapshot.exists) {
      throw new HttpsError('not-found', 'This challenge is no longer available.')
    }
    const user = userSnapshot.data()
    const challenge = challengeSnapshot.data()
    if (challenge.completed) throw new HttpsError('already-exists', 'You have already completed this challenge.')
    if (!Number.isInteger(challenge.points) || challenge.points < 1 || challenge.points > 150) {
      throw new HttpsError('failed-precondition', 'This challenge has an invalid point value.')
    }

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const streakDays = user.lastCompletedDay === today
      ? user.streakDays || 1
      : user.lastCompletedDay === yesterday ? (user.streakDays || 0) + 1 : 1
    let memberRef
    let groupRef
    let groupPoints
    if (user.groupId) {
      groupRef = db.doc(`groups/${user.groupId}`)
      memberRef = db.doc(`groups/${user.groupId}/members/${uid}`)
      const [memberSnapshot, groupSnapshot] = await Promise.all([
        transaction.get(memberRef),
        transaction.get(groupRef),
      ])
      if (!memberSnapshot.exists || !groupSnapshot.exists) {
        memberRef = null
        groupRef = null
      } else if (Number.isSafeInteger(groupSnapshot.data().points) && groupSnapshot.data().points >= 0) {
        groupPoints = groupSnapshot.data().points
      } else {
        const membersSnapshot = await transaction.get(groupRef.collection('members'))
        groupPoints = membersSnapshot.docs.reduce((total, member) => {
          const memberPoints = member.data().points
          if (!Number.isSafeInteger(memberPoints) || memberPoints < 0) {
            throw new HttpsError('failed-precondition', 'This group has invalid member point data.')
          }
          return total + memberPoints
        }, 0)
      }
    }
    transaction.update(challengeRef, { completed: true, completedAt: FieldValue.serverTimestamp() })
    transaction.update(userRef, {
      points: FieldValue.increment(challenge.points),
      completedCount: FieldValue.increment(1),
      streakDays,
      lastCompletedDay: today,
      updatedAt: FieldValue.serverTimestamp(),
    })
    if (memberRef && groupRef) {
      transaction.set(memberRef, {
        points: FieldValue.increment(challenge.points),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      transaction.update(groupRef, {
        points: groupPoints + challenge.points,
      })
    }
    return { pointsEarned: challenge.points }
  })
})

export const createGroup = onCall(async request => {
  const uid = requireUid(request)
  const name = typeof request.data?.name === 'string' ? request.data.name.trim() : ''
  const type = typeof request.data?.type === 'string' ? request.data.type : 'Friends'
  if (name.length < 3 || name.length > 40) {
    throw new HttpsError('invalid-argument', 'Group names must be between 3 and 40 characters.')
  }
  if (!groupTypes.includes(type)) {
    throw new HttpsError('invalid-argument', 'Choose a valid group type.')
  }
  const userRef = db.doc(`users/${uid}`)
  const groupRef = db.collection('groups').doc()
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (const byte of randomBytes(8)) code += alphabet[byte % alphabet.length]
  const codeRef = db.doc(`groupCodes/${code}`)
  const profile = profileFromToken(request)

  await db.runTransaction(async transaction => {
    const [userSnapshot, codeSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(codeRef),
    ])
    if (!userSnapshot.exists) throw new HttpsError('failed-precondition', 'Your profile is still being set up. Please try again.')
    if (userSnapshot.data().groupId) throw new HttpsError('failed-precondition', 'Leave your current group before creating another.')
    if (codeSnapshot.exists) throw new HttpsError('aborted', 'Please try creating your group again.')
    transaction.create(groupRef, {
      name,
      type,
      createdBy: uid,
      joinCode: code,
      memberCount: 1,
      points: 0,
      createdAt: FieldValue.serverTimestamp(),
    })
    transaction.create(codeRef, { groupId: groupRef.id, createdAt: FieldValue.serverTimestamp() })
    transaction.set(groupRef.collection('members').doc(uid), memberData(profile))
    transaction.update(userRef, {
      groupId: groupRef.id,
      groupName: name,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
  return { groupId: groupRef.id, name, type, joinCode: code }
})

export const joinGroup = onCall(async request => {
  const uid = requireUid(request)
  const code = typeof request.data?.code === 'string' ? request.data.code.trim().toUpperCase() : ''
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code)) throw new HttpsError('invalid-argument', 'Enter a valid 8-character group code.')
  const userRef = db.doc(`users/${uid}`)
  const codeRef = db.doc(`groupCodes/${code}`)
  const profile = profileFromToken(request)
  let joinedGroup

  await db.runTransaction(async transaction => {
    const [userSnapshot, codeSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(codeRef),
    ])
    if (!userSnapshot.exists) throw new HttpsError('failed-precondition', 'Your profile is still being set up. Please try again.')
    if (userSnapshot.data().groupId) throw new HttpsError('failed-precondition', 'Leave your current group before joining another.')
    if (!codeSnapshot.exists) throw new HttpsError('not-found', 'We could not find a group with that code.')
    const groupRef = db.doc(`groups/${codeSnapshot.data().groupId}`)
    const memberRef = groupRef.collection('members').doc(uid)
    const groupSnapshot = await transaction.get(groupRef)
    if (!groupSnapshot.exists) throw new HttpsError('not-found', 'This group is no longer available.')
    joinedGroup = { id: groupRef.id, ...groupSnapshot.data() }
    transaction.create(memberRef, memberData(profile))
    transaction.update(groupRef, { memberCount: FieldValue.increment(1) })
    transaction.update(userRef, {
      groupId: groupRef.id,
      groupName: groupSnapshot.data().name,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
  return { groupId: joinedGroup.id, name: joinedGroup.name, type: joinedGroup.type || 'Friends' }
})
