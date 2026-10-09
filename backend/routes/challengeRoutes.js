const express = require("express");                            // frame web for node

const router = express.Router();

const {
    getChallenges,
    getChallengeById,
} = require("../controllers/challengeController");


router.get("/", getChallenges);
router.get("/:id", getChallengeById);

module.exports = router;