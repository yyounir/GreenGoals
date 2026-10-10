# 🌱 GreenGoals

GreenGoals is a sustainability-focused lifestyle app that turns everyday good habits into a motivating, social game. Instead of asking people to be perfectly eco-conscious, it celebrates small, realistic actions—walking instead of driving, reducing waste, eating more sustainably, and helping your community—then rewards progress with points, streaks, and friendly competition.

## 🚀 Elevator pitch

GreenGoals helps people build greener habits through daily, achievable challenges and supportive accountability. It blends personal growth, social motivation, and lightweight game design to make sustainability feel approachable, rewarding, and fun.

## 🌍 What the app is about

The app is designed around a simple idea: small actions compound. Users sign in, see a fresh set of sustainability challenges each day, complete tasks that fit their routines, and earn points for their impact. They can also join a group—friends, classmates, clubs, or neighborhoods—and compare progress on a live leaderboard that makes sustainable living feel like a shared mission instead of a solo chore.

The product balances two key goals:

- Personal momentum: daily streaks, progress tracking, and challenge completion.
- Collective impact: teams and groups working together toward a greener outcome.

## 🎨 Visuals and user experience

The frontend is built to feel optimistic, warm, and motivating. It uses a leafy eco aesthetic with soft gradients, friendly card layouts, and a clear dashboard that encourages clarity and progress.

### 🌿 Product visuals

Key visual features include:

- A hero landing page with a sustainability-first value proposition and a strong call to action.
- A dashboard overview with welcome messaging, impact stats, and a streak summary.
- Challenge cards with clear categories, points, durations, and completion states.
- A leaderboard experience that highlights individual contribution and group performance.
- Group creation and joining flows for building community around green habits.
- An illustration-based interface that reinforces the theme of growth, progress, and positive impact.

The experience is intentionally friendly and action-driven: users know exactly what to do next, how their effort is being rewarded, and how their community is progressing alongside them.

## ✨ Key features

- Google sign-in with Firebase authentication
- Daily, AI-generated sustainability challenges powered by Gemini
- Challenge completion flow with secure server-side validation and point awards
- User profile tracking with points, streaks, and completion counts
- Group creation and joining for social accountability
- Live leaderboard with member rankings and team totals
- Demo mode for exploring the interface without Firebase setup
- Frontend-only quick start for local previews and experimentation

## 🛠️ Tech stack

- React + Vite for the frontend experience
- Firebase Authentication for user sign-in
- Cloud Firestore for persistent user, challenge, and group data
- Cloud Functions for secure backend logic and server-side transaction handling
- Google GenAI / Gemini for one-per-day challenge generation
- JavaScript/React for component-driven UI logic
- CSS for the custom visual design and responsive dashboard layout

## 🏗️ System architecture

GreenGoals uses a simple but effective architecture:

1. Frontend client
   - React app renders the landing page, challenge dashboard, group flows, and leaderboard.
   - User actions are routed through Firebase-backed services and callable functions.

2. Authentication layer
   - Users sign in with Google.
   - Authentication state is managed through Firebase Auth.

3. Data and persistence layer
   - User profiles, challenge records, and group memberships live in Firestore.
   - Sensitive actions such as awarding points or generating challenges are not trusted from the browser.

4. Secure backend services
   - Cloud Functions validate the user session and perform critical logic in Firestore transactions.
   - Points are only awarded from the challenge document and transaction context, preventing client-side tampering.

5. AI challenge generation
   - Gemini generates a fresh set of inclusive, practical sustainability challenges for each user once per UTC day.
   - The backend stores the generated tasks and exposes them to the client without letting the browser directly control reward logic.

6. Social accountability layer
   - Users can create or join groups.
   - Group membership rules ensure leaderboard access is consistent and limited to authenticated members.

This design keeps the app responsive while preserving trust and integrity in the reward and leaderboard system.

## 🚀 Getting started

### Local development

```sh
npm install
npm run dev
```

### Firebase setup

1. Create a Firebase project and register a web app.
2. In Authentication → Sign-in method, enable Google and add your local and deployed hostnames under Authorized domains.
3. Create a Cloud Firestore database.
4. Copy `.env.example` to `.env` and populate the Firebase web config values (`apiKey`, `authDomain`, `projectId`, and `appId`).
5. Install Node.js 22 and the Firebase CLI, then sign in with `firebase login` and select the project with `firebase use --add`.
6. Add your Gemini API key as a Functions secret:

```sh
firebase functions:secrets:set GEMINI_API_KEY
```

7. Deploy the Firestore rules and backend functions:

```sh
firebase deploy --only firestore:rules,functions
```

### Notes

- Firebase Functions and Gemini usage may require the project’s Blaze billing plan.
- The client and functions default to the `us-central1` region; override with `VITE_FIREBASE_FUNCTIONS_REGION` if needed.
- Firestore client writes are intentionally denied for security. The callable functions handle user initialization, challenge generation, challenge completion, and group membership flows.

## 🧪 Demo mode and limitations

Choose Explore the demo to preview the experience without Firebase configuration. The demo uses sample challenges and a sample leaderboard and is intentionally local to the page session. It does not persist across refreshes or real user accounts.

The production version of the app requires Firebase setup and authenticated data persistence. Daily challenge generation is also rate-limited to once per UTC day per user, which helps keep the experience intentional and prevents repeated AI generation.

## 💡 Lessons learned

- Small actions matter: the app is most effective when sustainability feels realistic and doable instead of perfection-driven.
- Motivation improves when progress is visible: points, streaks, and leaderboards turn healthy behavior into a habit loop.
- Social context increases engagement: joining a group makes sustainable behavior more communal and encouraging.
- Trust matters in gamified systems: awarding points and progress must happen on the server, not the client.
- AI can personalize habit-building, but it should support everyday life rather than create unrealistic demands.
- Clean UX and friendly design are critical for habit apps; the product needs to feel encouraging, not transactional.

## 📌 Project summary

GreenGoals is a green habit tracker and social challenge app that helps people make better choices through small, measurable, repeatable actions. It blends sustainability, accountability, and playful motivation into one product experience—designed to make eco-friendly living feel achievable, social, and rewarding.

## License

    Copyright 2026 Yasir Y.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
