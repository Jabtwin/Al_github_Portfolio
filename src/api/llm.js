"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReposWithJD = analyzeReposWithJD;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("../types");
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
async function analyzeReposWithJD(repos, jd) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: generative_ai_1.Type.OBJECT,
                properties: {
                    selected_repos: {
                        type: generative_ai_1.Type.ARRAY,
                        items: {
                            type: generative_ai_1.Type.OBJECT,
                            properties: {
                                repo_name: { type: generative_ai_1.Type.STRING },
                                match_score: { type: generative_ai_1.Type.NUMBER, description: '0 to 100' },
                                tailored_summary: { type: generative_ai_1.Type.STRING, description: 'A 2-sentence summary explaining why this repo proves the candidate fits the JD.' },
                                highlighted_skills: { type: generative_ai_1.Type.ARRAY, items: { type: generative_ai_1.Type.STRING } },
                            },
                            required: ['repo_name', 'match_score', 'tailored_summary', 'highlighted_skills'],
                        },
                    },
                },
                required: ['selected_repos'],
            },
        },
    });
    const prompt = `
You are an expert technical recruiter. Analyze the following GitHub repositories against this Job Description.
Select the top 3 most relevant repositories. For each, assign a match score and write a tailored summary explaining why the candidate's work on this repo perfectly demonstrates the skills required in the JD.

Job Description:
${jd}

Candidate Repositories:
${JSON.stringify(repos, null, 2)}
`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    try {
        return JSON.parse(responseText);
    }
    catch (error) {
        console.error("Failed to parse JSON from AI response.", error);
        throw new Error("AI returned invalid format.");
    }
}
//# sourceMappingURL=llm.js.map