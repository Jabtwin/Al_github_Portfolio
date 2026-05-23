import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIResponse, Repo } from '../types';

export async function analyzeReposWithJD(repos: Repo[], jd: string, apiKey: string): Promise<AIResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          selected_repos: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                repo_name: { type: SchemaType.STRING },
                match_score: { type: SchemaType.NUMBER, description: '0 to 100' },
                tailored_summary: { type: SchemaType.STRING, description: 'A 2-sentence summary explaining why this repo proves the candidate fits the JD.' },
                highlighted_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
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
    return JSON.parse(responseText) as AIResponse;
  } catch (error) {
    console.error("Failed to parse JSON from AI response.", error);
    throw new Error("AI returned invalid format.");
  }
}
