Challenge system backend highlights (Carl Sierra)

The Green Goals backend powers the environmental challenge system, allowing users to explore sustainability challenges, generate new challenges using AI, and earn points for completing them.


Files Created:
---------------------------------------------------------------------------------------------------------------------------------
server.js =  Initializes the Express server, loads environment variables, and registers API routes.
---------------------------------------------------------------------------------------------------------------------------------
routes/challengeRoutes.js = defines the api endpoints and connects incoming requests to the functions within challengeController
---------------------------------------------------------------------------------------------------------------------------------
controllers/challengeController.js = Contains the challenge logic, including retrieving challenges, generating AI-powered challenges with Gemini, validating generated data, and processing challenge completions and points.

Functions of challengeController.js: 

getChallenges(req, res): retrive all challenges which includes pre-defined ones and ai generated 
getChallengesById(req, res): Searches for a challenge using its ID and returns its details. If the challenge doesn't exist, it responds with a 404 Challenge not found error.
completeChallenge(req, res): Validates the challenge and user, prevents duplicate completions, records the completed challenge, and awards points to the user and their group if applicable.
generateChallenges(req, res): Uses the Google Gemini API to generate five environmental challenges. It requests structured JSON, retries certain temporary API errors, validates the generated data, assigns unique IDs, and adds the new challenges to the in-memory challenge list.
---------------------------------------------------------------------------------------------------------------------------------
data/challenges.js = Stores the predefined environmental challenges and holds generated challenges during the current server session.
---------------------------------------------------------------------------------------------------------------------------------
data/users.js = Contains the user data used by the current challenge-completion and point-awarding logic.
data/groups.js = Contains group data used to update group points when a member completes a challenge.

Development Notes and Limitations

Placeholder User and Group Data

The current data/users.js and data/groups.js files contain placeholder data used to develop and test the challenge completion and point-awarding system. They are not the final user and group implementations.

The challenge controller currently uses this sample data to test:

User validation during challenge completion.

Prevention of duplicate challenge completions.

Individual point awards.

Group point updates when a user belongs to a group.

Integration note: These placeholder files should be replaced or integrated with the actual user and group system developed by the team. The controller may need to be updated to match the final data structures and storage approach.

Challenge, user, and group data are currently stored in memory and may reset when the backend server restarts.
---------------------------------------------------------------------------------------------------------------------------------
package.json = Lists backend dependencies and project scripts, such as starting the server.
---------------------------------------------------------------------------------------------------------------------------------
.env = Stores environment variables, including the Gemini API key used to authenticate requests to the Google Gemini API.
.gitignore = tells Git which files and folders it should not track, such as your private .env file and installed dependencies.
