import { loadDataServices } from './firebase'

async function callFunction(name, data = {}) {
  const firebase = await loadDataServices()
  if (!firebase) throw new Error('Firebase is not configured.')
  const result = await firebase.functionsModule.httpsCallable(firebase.functions, name)(data)
  return result.data
}

export const initializeUser = () => callFunction('initializeUser')
export const generateChallenges = () => callFunction('generateChallenges')
export const completeChallenge = challengeId => callFunction('completeChallenge', { challengeId })
export const createGroup = (name, type) => callFunction('createGroup', { name, type })
export const joinGroup = code => callFunction('joinGroup', { code })
