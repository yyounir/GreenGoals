const challenges = require("../data/challenges");                               // imports challenges

function getChallenges(req, res) {res.json(challenges);}                         // returns all 15 challenges res = request, res = response

function getChallengeById(req, res) {                                            // returns one specific challenge by its ID, or a 404 error if it doesn't exist.
    const id = Number(req.params.id);
    const challenge = challenges.find(challenge => challenge.id === id);

    if (!challenge) {
        return res.status(404).json({message: "Challenge not found"});          // error
    }

    res.json(challenge);
}


// complete challenge controller section

module.exports = {
    getChallenges,
    getChallengeById,
};