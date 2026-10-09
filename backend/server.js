const express = require("express");                                                  // 1. Get Express 

const app = express();                                                               // 2. Create the server

app.use(express.json());                                                             // 3. Configure the server                  

const challengeRoutes = require("./routes/challengeRoutes");                         // 4. Get your routes    

app.use("/api/challenges", challengeRoutes);                                         // 5. Connect the routes

app.listen(3000, () => {console.log("Server running on port 3000");});               // 6. Start the server








//server.js
//   ↓
//challengeRoutes.js
//   ↓
//challengeController.js
//   ↓
//challenges.js