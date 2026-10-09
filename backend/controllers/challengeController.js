const challenges = require("../data/challenges");    
const groups = require("../data/groups");
const users = require("../data/users");


function getChallenges(req, res) {res.json(challenges);}                         

function getChallengeById(req, res) {                                            
    const id = Number(req.params.id);
    const challenge = challenges.find(challenge => challenge.id === id);

    if (!challenge) {
        return res.status(404).json({message: "Challenge not found"});          
    }

    res.json(challenge);
}


function completeChallenge(req, res) {
  const challengeId = Number(req.params.id);
  const userId = Number(req.body.userId);
  const challenge = challenges.find(challenge => challenge.id === challengeId);



  if (!challenge) {
    return res.status(404).json({message: "Challenge not found"});
  }

  // Find the user
  const user = users.find(user => user.id === userId);

  if (!user) {
    return res.status(404).json({message: "User not found"});
  }

  // Make sure the user has a completedChallenges array
  if (!Array.isArray(user.completedChallenges)) {user.completedChallenges = [];}

  // Prevent duplicate completion
  if (user.completedChallenges.includes(challengeId)) {
    return res.status(400).json({message: "Challenge already completed"});
  }

  // Record completion and award individual points
  user.completedChallenges.push(challengeId);
  user.points = (user.points || 0) + challenge.points;

  // Find the user's group, if they belong to one
  let group = null;

  if (user.groupId != null) {
    group = groups.find(group => group.id === user.groupId);
    if (group) {group.points = (group.points || 0) + challenge.points;}
  }
  
  // Return the result
  return res.status(200).json({
    message: "Challenge completed successfully",
    challenge: challenge.name,
    pointsAwarded: challenge.points,
    userPoints: user.points,
    groupPoints: group ? group.points : null
  });
}


module.exports = {
    getChallenges,
    getChallengeById,
    completeChallenge
};