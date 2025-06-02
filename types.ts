
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // Should be array of strings like ["Photosynthesis is...", "Cellular respiration is..."]
  correctAnswer: string; // This should be the actual text of the correct option, e.g., "Photosynthesis is..."
  explanation?: string;
  userAnswer?: string; // Text of the user's selected option
  isCorrect?: boolean; // Determined after user answers
}

export interface ExternalResource {
  title: string;
  uri: string;
  type?: string; // e.g., 'Web Page', 'Video', 'Article'
}

export interface GroundingAttribution {
  uri: string;
  title: string;
  source?: string; // To indicate if it's from web search explicitly
}

export enum ContentType {
  Notes = "notes",
  Flashcards = "flashcards",
  Quiz = "quiz",
  Resources = "resources", // This tab will show grounding and explicitly generated resources
}

export interface ApiError {
  message: string;
  details?: any;
}

// Response types from Gemini Service (expected parsed structure)
export interface NotesResponse {
  notes: string;
  groundingAttributions?: GroundingAttribution[];
}

export interface FlashcardsResponse {
  flashcards: Flashcard[];
  groundingAttributions?: GroundingAttribution[];
}

export interface QuizAndResourcesResponse {
  quiz: QuizQuestion[];
  resources: ExternalResource[];
  groundingAttributions?: GroundingAttribution[];
}

// For structured JSON communication with Gemini
export interface GeminiFlashcard {
  question: string;
  answer: string;
}

export interface GeminiQuizQuestion {
  question: string;
  options: string[]; // ["Option A text", "Option B text", ...]
  correctAnswerText: string; // The full text of the correct answer
  explanation?: string;
}
