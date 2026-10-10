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

  
    const user = users.find(user => user.id === userId);                                              // Find the user

    if (!user) {
        return res.status(404).json({message: "User not found"});
    }

  
    if (!Array.isArray(user.completedChallenges)) {user.completedChallenges = [];}                    // Make sure the user has a completedChallenges array

 
    if (user.completedChallenges.includes(challengeId)) {
        return res.status(400).json({message: "Challenge already completed"});                          // Prevent duplicate completion
    }

 
    user.completedChallenges.push(challengeId);                                                       // Record completion and award individual points
    user.points = (user.points || 0) + challenge.points;

  
    let group = null;                                                                                 // Find the user's group, if they belong to one

    if (user.groupId != null) {
        group = groups.find(group => group.id === user.groupId);
        if (group) {group.points = (group.points || 0) + challenge.points;}
    }
  
  
    return res.status(200).json({
        message: "Challenge completed successfully",                                                    // Return the result
        challenge: challenge.title,
        pointsAwarded: challenge.points,
        userPoints: user.points,
        groupPoints: group ? group.points : null
    });
}








async function generateChallenges(req, res) {
    try {
        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });


        // Categories supported by Green Goals.
        const categories = [ "Waste", "Water", "Transportation", "Nature", "Community Action"];


        // Tell Gemini which challenge fields to generate.
        const prompt = `
            Generate exactly 5 original environmental challenges for Green Goals.

            Use only these categories:
            ${categories.join(", ")}.

            For each challenge, provide:
            - title: a short, clear name
            - description: practical instructions explaining how to complete it
            - category: one of the allowed categories
            - points: an integer from 5 to 25 based on the effort and environmental impact required

            Requirements:
            - Make challenges realistic and achievable for the average student or community member.
            - Challenges can be completed at school, at home, or in the local community.
            - Prefer everyday actions that require little or no money, special equipment, or prior experience.
            - Avoid requiring users to own specific items, have outdoor space, control household facilities, or organize a large group.
            - When an activity depends on resources or circumstances that not everyone has, offer a practical alternative.
            - Keep instructions clear, specific, and easy to understand.
            - Make challenges safe and appropriate for a general audience.
            - For transportation challenges, prioritize safety and allow alternatives when walking, cycling, or using a scooter is impractical.
            - For water challenges, avoid strict requirements that ignore individual needs or circumstances.
            - For nature challenges, allow users to care for existing plants or participate in approved gardening activities instead of requiring them to buy plants.
            - Community Action challenges should emphasize group participation or positive community impact, while allowing users to join existing activities.
            - Avoid repetitive challenges and vary the effort required.
            - Do not require users to purchase supplies or perform activities without appropriate permission.
            - Return exactly 5 challenges as structured JSON with the required fields.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING" },
                            description: { type: "STRING" },
                            category: {
                                type: "STRING",
                                enum: categories
                            },
                            points: { type: "INTEGER" }
                        },
                        required: [
                            "title",
                            "description",
                            "category",
                            "points"
                        ],
                        propertyOrdering: [
                            "title",
                            "description",
                            "category",
                            "points"
                        ]
                    }
                }
            }
        });

        // Convert Gemini's JSON text into JavaScript objects.
        const generated = JSON.parse(response.text);

        // Validate the response before using it.
        if (
            !Array.isArray(generated) ||
            generated.length !== 5 ||
            generated.some(c =>
                typeof c.title !== "string" ||
                !c.title.trim() ||
                typeof c.description !== "string" ||
                !c.description.trim() ||
                !categories.includes(c.category) ||
                !Number.isInteger(c.points) ||
                c.points < 5 ||
                c.points > 25
            )
        ) {
            throw new Error("Gemini returned invalid challenges");
        }

        // Give every generated challenge a unique ID.
        const nextId = Math.max(
            0,
            ...challenges.map(c => Number(c.id) || 0)
        ) + 1;

        const newChallenges = generated.map((c, index) => ({
            id: nextId + index,
            title: c.title.trim(),
            description: c.description.trim(),
            category: c.category,
            points: c.points
        }));

        challenges.push(...newChallenges);                                      // Add the new challenges to the existing data list

        // Return the challenges to the frontend.
        res.status(200).json({
            challenges: newChallenges
        });

    } catch (error) {
        console.error("Gemini generation error:", error.message);

        res.status(500).json({
            message: "Failed to generate challenges"
        });
    }
}




module.exports = {
    getChallenges,
    getChallengeById,
    completeChallenge,
    generateChallenges
};