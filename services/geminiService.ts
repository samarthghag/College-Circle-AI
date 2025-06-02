import { GoogleGenAI, GenerateContentResponse, Part, Tool, GenerationConfig } from "@google/genai";
import type { NotesResponse, FlashcardsResponse, QuizAndResourcesResponse, GroundingAttribution, GeminiFlashcard, GeminiQuizQuestion, ExternalResource } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Use the provided API key directly
const API_KEY = "AIzaSyAnsxlbFcLAsTxKyjkNNzFiQohJsFf00HE";

if (!API_KEY) {
  console.error("API_KEY not found. Please ensure it's correctly set in geminiService.ts.");
  // In a real app, you might want to prevent initialization or show an error to the user.
}

const MAX_COURSE_PLAN_CHAR_LENGTH = 250000; // Approx 60k-70k tokens, leaving room for query & other parts.

export class GeminiService {
  private static instance: GeminiService;
  private ai: GoogleGenAI;

  private constructor() {
    if (!API_KEY) {
      // This will effectively make the service non-functional if API_KEY is missing.
      // Error is already logged, so we just ensure `ai` is not used if uninitialized.
      this.ai = null as any; // Assign null and cast to satisfy TypeScript if API_KEY is missing
      return;
    }
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private truncateCoursePlan(coursePlan?: string): string {
    if (coursePlan && coursePlan.length > MAX_COURSE_PLAN_CHAR_LENGTH) {
      console.warn(`Course plan was truncated from ${coursePlan.length} to ${MAX_COURSE_PLAN_CHAR_LENGTH} characters to fit within API limits.`);
      return coursePlan.substring(0, MAX_COURSE_PLAN_CHAR_LENGTH) + "\n\n[COURSE PLAN TRUNCATED DUE TO LENGTH]";
    }
    return coursePlan || "No course plan provided.";
  }

  private parseJsonResponse<T>(responseText: string): T {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/si; // Case-insensitive for 'json'
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    try {
      return JSON.parse(jsonStr) as T;
    } catch (e1) {
      const e1Msg = e1 instanceof Error ? e1.message : String(e1);
      console.warn("Initial JSON.parse failed. Attempting to extract JSON by bracket balancing.", {
         error: e1Msg,
         trimmedOriginalStringStart: jsonStr.substring(0, 200),
         trimmedOriginalStringEnd: jsonStr.substring(Math.max(0, jsonStr.length - 200))
      });

      let firstOpenBracketIndex = -1;
      let openBracketChar: '{' | '[' | null = null;
      let closeBracketChar: '}' | ']' | null = null;

      const firstCurly = jsonStr.indexOf('{');
      const firstSquare = jsonStr.indexOf('[');

      if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        firstOpenBracketIndex = firstCurly;
        openBracketChar = '{';
        closeBracketChar = '}';
      } else if (firstSquare !== -1) {
        firstOpenBracketIndex = firstSquare;
        openBracketChar = '[';
        closeBracketChar = ']';
      }

      if (firstOpenBracketIndex !== -1 && openBracketChar && closeBracketChar) {
        let balance = 0;
        let potentialJsonEndIndex = -1;
        for (let i = firstOpenBracketIndex; i < jsonStr.length; i++) {
          if (jsonStr[i] === openBracketChar) {
            balance++;
          } else if (jsonStr[i] === closeBracketChar) {
            balance--;
          }
          // When balance is 0, we've found the end of the first complete JSON structure
          if (balance === 0) { 
            potentialJsonEndIndex = i;
            break;
          }
        }

        if (potentialJsonEndIndex !== -1) {
          const potentialJson = jsonStr.substring(firstOpenBracketIndex, potentialJsonEndIndex + 1);
          try {
            return JSON.parse(potentialJson) as T;
          } catch (e2) {
            const e2Msg = e2 instanceof Error ? e2.message : String(e2);
            console.error("Bracket-balanced JSON.parse also failed.", {
              error: e2Msg,
              attemptedSubstringStart: potentialJson.substring(0, 200),
              attemptedSubstringEnd: potentialJson.substring(Math.max(0, potentialJson.length - 200)),
            });
            // Throw a more specific error if the second parse fails
            throw new Error(`Failed to parse AI's JSON response even after attempting to extract by bracket balancing. Error: ${e2Msg}. Extracted snippet: ${potentialJson.substring(0,200)}...`);
          }
        }
      }
      
      // If bracket balancing didn't find a suitable JSON structure or failed
      console.error("Failed to parse JSON response; no valid JSON structure could be reliably extracted by balancing.", {
          originalStringBriefStart: responseText.substring(0,200),
          originalStringBriefEnd: responseText.substring(Math.max(0, responseText.length - 200))
      });
      throw new Error(`Failed to parse AI's JSON response. Initial Error: ${e1Msg}. Raw output snippet: ${responseText.substring(0, 200)}...`);
    }
  }

  private extractGroundingAttributions(response: GenerateContentResponse): GroundingAttribution[] {
    const attributions: GroundingAttribution[] = [];
    response.candidates?.forEach(candidate => {
      candidate.groundingMetadata?.groundingChunks?.forEach(chunk => {
        if (chunk.web?.uri) {
          attributions.push({ uri: chunk.web.uri, title: chunk.web.title || 'Untitled Web Resource' });
        }
      });
    });
    return attributions;
  }
  
  private async generateContentWithConfig(
    promptContent: string, 
    hasCoursePlanContent: boolean, // Use boolean to decide if search is default
    systemInstruction?: string,
    requestGoogleSearchOverride?: boolean
  ): Promise<GenerateContentResponse> {
    if (!this.ai) {
       throw new Error("Gemini AI Service not initialized. API_KEY might be missing.");
    }

    const model = 'gemini-2.5-flash-preview-04-17';
    const userQueryParts: Part[] = [{ text: promptContent }]; 
    
    const tools: Tool[] = [];
    // Request Google Search if explicitly asked OR if no course plan content is available
    if (requestGoogleSearchOverride || !hasCoursePlanContent) { 
        tools.push({ googleSearch: {} });
    }
    
    const config: GenerationConfig & { systemInstruction?: string; tools?: Tool[] } = {
      // temperature: 0.7, // Consider 0.2-0.5 for stricter JSON adherence if issues persist
    };

    if (tools.length > 0) {
      config.tools = tools;
    } else {
      // Only set responseMimeType if not using tools (like Google Search)
      config.responseMimeType = "application/json";
    }

     if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }


    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: [{ role: "user", parts: userQueryParts }], 
        config: config,
      });
      return response;
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      let detailedMessage = "An unknown error occurred with the Gemini API.";
      if (error instanceof Error) {
        detailedMessage = error.message;
      }
      if (typeof error.message === 'string' && (error.message.includes("API key not valid") || error.message.includes("got status:"))) {
         detailedMessage = error.message; 
      } else if (error.cause && typeof error.cause.message === 'string') { 
         detailedMessage = error.cause.message;
      }
      
      throw new Error(`Gemini API Error: ${detailedMessage}`);
    }
  }


  public async generateNotes(query: string, coursePlan?: string): Promise<NotesResponse> {
    const processedCoursePlan = this.truncateCoursePlan(coursePlan);
    const systemInstruction = `You are an expert academic assistant. Your output MUST be a single, perfectly valid JSON object. Do NOT include any text outside of this JSON object, not even explanations or conversational remarks. 
The JSON object must have a single key "notes", and its value must be a string containing the notes in Markdown format. 
Pay meticulous attention to JSON syntax: proper quoting of keys and string values, and ensure the entire output is one single JSON object. 
Example: {"notes": "### Topic 1\\n- Point A\\n- Point B\\n### Topic 2\\n- Point C"}
If a course plan is provided, strictly adhere to its references and topics. If not, use your general knowledge and web search for content.`;
    const userPrompt = `
      Course Plan Context (if any):
      \`\`\`
      ${processedCoursePlan}
      \`\`\`
      Query: "${query}"

      Generate detailed study notes based on the query and course plan (if provided).
    `;
    const hasContentInPlan = !!coursePlan && coursePlan.trim().length > 0;
    const response = await this.generateContentWithConfig(userPrompt, hasContentInPlan, systemInstruction);
    const parsed = this.parseJsonResponse<{ notes: string }>(response.text || '');
    return {
      notes: parsed.notes,
      groundingAttributions: this.extractGroundingAttributions(response)
    };
  }

  public async generateFlashcards(query: string, coursePlan?: string): Promise<FlashcardsResponse> {
    const processedCoursePlan = this.truncateCoursePlan(coursePlan);
    const systemInstruction = `You are an expert flashcard creator. Your output MUST be a single, perfectly valid JSON object. Do NOT include any text outside of this JSON object, not even explanations or conversational remarks.
The JSON object must have a key "flashcards", which is an array of objects. Each object in the array must have a "question" string key and an "answer" string key.
Pay meticulous attention to JSON syntax, especially commas between elements in arrays or objects, and proper quoting of all keys and string values.
Example: {"flashcards": [{"question": "What is X?", "answer": "X is Y."},{"question": "What is Z?", "answer": "Z is A."}]}
If a course plan is provided, strictly adhere to its references and topics. If not, use general knowledge and web search for content.`;
    const userPrompt = `
      Course Plan Context (if any):
      \`\`\`
      ${processedCoursePlan}
      \`\`\`
      Query: "${query}"

      Generate 5-10 flashcards based on the query and course plan (if provided).
    `;
    const hasContentInPlan = !!coursePlan && coursePlan.trim().length > 0;
    const response = await this.generateContentWithConfig(userPrompt, hasContentInPlan, systemInstruction);
    const parsed = this.parseJsonResponse<{ flashcards: GeminiFlashcard[] }>(response.text || '');
    return {
      flashcards: parsed.flashcards.map(fc => ({ ...fc, id: uuidv4() })),
      groundingAttributions: this.extractGroundingAttributions(response)
    };
  }

  public async generateQuizAndResources(query: string, coursePlan?: string): Promise<QuizAndResourcesResponse> {
    const processedCoursePlan = this.truncateCoursePlan(coursePlan);
    const systemInstruction = `You are an expert quiz and resource curator. Your output MUST be a single, perfectly valid JSON object. Do NOT include any text outside of this JSON object, not even explanations or conversational remarks.
The JSON object must have two keys: "quiz" and "resources".
The value for "quiz" MUST be an array of quiz question objects. Each quiz question object MUST have the following string keys: "question", "correctAnswerText" (which must be one of the provided options), and optionally "explanation". It MUST also have an "options" key, whose value is an array of 4 unique strings representing the choices.
The value for "resources" MUST be an array of resource objects. Each resource object MUST have "title" (string) and "uri" (string) keys, and optionally a "type" key (e.g., 'YouTube Channel', 'Article', 'Research Paper', 'Book', 'Online Notebook', 'Course Material').
Suggest a diverse range of 2-4 resources. Include types like relevant YouTube channels, insightful articles, official documentation, resource materials (e.g., PDFs, slides), research papers, online interactive notebooks (e.g., Jupyter, Colab), seminal books, or other globally recognized recommendations pertinent to the query.
Pay meticulous attention to JSON syntax: commas between array elements and key-value pairs, proper quoting of all keys and string values.
Example: {"quiz": [{"question": "What is the capital of France?", "options": ["London", "Berlin", "Paris", "Madrid"], "correctAnswerText": "Paris", "explanation": "Paris is the capital city of France."}], "resources": [{"title": "Khan Academy - World History", "uri": "https://www.youtube.com/user/khanacademylife", "type": "YouTube Channel"}, {"title": "A Brief History of Time by Stephen Hawking", "uri": "https://example.com/book/a-brief-history-of-time", "type": "Book"}]}
If a course plan is provided, strictly adhere to its references and topics. If not, use general knowledge and web search for content.`;
    const userPrompt = `
      Course Plan Context (if any):
      \`\`\`
      ${processedCoursePlan}
      \`\`\`
      Query: "${query}"

      Based on the above:
      1. Generate a 2-3 question multiple-choice quiz.
      2. Suggest 2-4 diverse external learning resources (e.g., YouTube channels, articles, research papers, books, online notebooks, course materials).
    `;
    const hasContentInPlan = !!coursePlan && coursePlan.trim().length > 0;
    // Always allow/request Google Search for resources, and also if no course plan is provided for the quiz part.
    const response = await this.generateContentWithConfig(userPrompt, hasContentInPlan, systemInstruction, true); 
    const parsed = this.parseJsonResponse<{ quiz: GeminiQuizQuestion[], resources: Array<ExternalResource> }>(response.text || '');
    
    return {
      quiz: parsed.quiz.map(q => ({ 
        ...q, 
        id: uuidv4(),
        correctAnswer: q.correctAnswerText // map correctAnswerText to correctAnswer
      })),
      resources: parsed.resources || [], // Ensure resources is an array even if missing in response
      groundingAttributions: this.extractGroundingAttributions(response)
    };
  }
}
