# GreenGoals

GreenGoals is a React and Vite frontend backed by Firebase Authentication, Cloud Firestore, and callable Cloud Functions. Authenticated users can keep their points, get daily Gemini-generated challenges, complete challenges securely, create or join a group, and see their group's live leaderboard. A frontend-only demo remains available without Firebase credentials.

## Run locally

```sh
npm install
npm run dev
```

## Firebase setup

1. Create a Firebase project and register a Web app.
2. In **Authentication → Sign-in method**, enable Google. Add your local/deployed hostnames under **Authorized domains**.
3. Create a Cloud Firestore database.
4. Copy `.env.example` to `.env` and fill in the Firebase Web app values (`apiKey`, `authDomain`, `projectId`, and `appId`). The web API key is public project configuration, not a service-account credential.
5. Install Node.js 22 and the Firebase CLI, sign in with `firebase login`, then select the Firebase project with `firebase use --add`.
6. Provide the Gemini API key as a Functions secret; never put it in a `VITE_*` variable:

   ```sh
   firebase functions:secrets:set GEMINI_API_KEY
   ```

7. Deploy the Firestore rules and backend functions:

   ```sh
   firebase deploy --only firestore:rules,functions
   ```

Cloud Functions deployment and Gemini API usage may require the Firebase project's Blaze billing plan. The client and Functions default to `us-central1`; set `VITE_FIREBASE_FUNCTIONS_REGION` if deploying Functions to a different region.

Firestore client writes are deliberately denied. Callable functions verify Firebase Auth and perform profile creation, one-per-day challenge generation, challenge completion and point awards, and group creation/joining. Group membership is required before reading group documents or leaderboard members. Points cannot be supplied by the browser; they are awarded only from the stored challenge record in a Firestore transaction.

Groups can be created as a class, club, friend group, organization, or neighborhood. Group totals and each member's contribution are updated with challenge awards and shown alongside the group leaderboard.

## Demo and limitations

Choose **Explore the demo** to use sample challenges and a sample leaderboard without Firebase. Demo actions are local to the page session and do not persist. Firebase sign-in and persistent data require the setup above. The generated challenges are produced once per UTC day per account; the button loads the day's challenge set again rather than asking Gemini for a second set.
