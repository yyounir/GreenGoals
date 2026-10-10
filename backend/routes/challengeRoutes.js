const express = require("express");                            // frame web for node

const router = express.Router();

const {
    getChallenges,
    getChallengeById,
    completeChallenge,
    generateChallenges,
} = require("../controllers/challengeController");


router.get("/", getChallenges);
router.get("/:id", getChallengeById);
router.post("/:id/complete", completeChallenge);
router.post("/generate", generateChallenges);


module.exports = router;