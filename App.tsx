import React, { useState, useCallback } from 'react';
import { Header } from 'components/Header';
import { CourseInput } from 'components/CourseInput';
import { QueryInput } from 'components/QueryInput';
import { ResultsDisplay } from 'components/ResultsDisplay';
import { LoadingSpinner } from 'components/LoadingSpinner';
import { GeminiService } from 'services/geminiService';
import type { Flashcard, QuizQuestion, ExternalResource, GroundingAttribution, ApiError } from './types';
import { ContentType } from './types';

const App: React.FC = () => {
  const [coursePlan, setCoursePlan] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  
  const [notes, setNotes] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [externalResources, setExternalResources] = useState<ExternalResource[]>([]);
  const [groundingAttributions, setGroundingAttributions] = useState<GroundingAttribution[]>([]);

  const [isLoading, setIsLoading] = useState({
    [ContentType.Notes]: false,
    [ContentType.Flashcards]: false,
    [ContentType.Quiz]: false,
    [ContentType.Resources]: false, // For explicitly fetched resources / combined view
  });

  const [errors, setErrors] = useState<{ [key in ContentType]?: string | null }>({
    [ContentType.Notes]: null,
    [ContentType.Flashcards]: null,
    [ContentType.Quiz]: null,
    [ContentType.Resources]: null,
  });

  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.Notes);

  const geminiService = GeminiService.getInstance();

  const handleGenerate = useCallback(async () => {
    if (!query.trim()) {
      alert('Please enter a query.');
      return;
    }

    setIsLoading({ notes: true, flashcards: true, quiz: true, resources: true });
    setErrors({ notes: null, flashcards: null, quiz: null, resources: null });
    setNotes(null);
    setFlashcards([]);
    setQuizQuestions([]);
    setExternalResources([]);
    setGroundingAttributions([]);
    setActiveTab(ContentType.Notes);

    const commonErrorHandler = (contentType: ContentType, error: unknown) => {
      console.error(`Error generating ${contentType}:`, error);
      let errorMessage = `Failed to generate ${contentType}.`;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setErrors(prev => ({ ...prev, [contentType]: errorMessage }));
    };

    // Fetch Notes
    geminiService.generateNotes(query, coursePlan)
      .then(data => {
        setNotes(data.notes);
        if (data.groundingAttributions) setGroundingAttributions(prev => [...prev, ...(data.groundingAttributions || [])]);
      })
      .catch(error => commonErrorHandler(ContentType.Notes, error))
      .finally(() => setIsLoading(prev => ({ ...prev, [ContentType.Notes]: false })));

    // Fetch Flashcards
    geminiService.generateFlashcards(query, coursePlan)
      .then(data => {
        setFlashcards(data.flashcards);
        if (data.groundingAttributions) setGroundingAttributions(prev => [...prev, ...(data.groundingAttributions || [])]);
      })
      .catch(error => commonErrorHandler(ContentType.Flashcards, error))
      .finally(() => setIsLoading(prev => ({ ...prev, [ContentType.Flashcards]: false })));

    // Fetch Quiz and an initial set of resources
    geminiService.generateQuizAndResources(query, coursePlan)
      .then(data => {
        setQuizQuestions(data.quiz);
        setExternalResources(prev => [...prev, ...data.resources]);
        if (data.groundingAttributions) setGroundingAttributions(prev => 
          Array.from(new Map([...prev, ...(data.groundingAttributions || [])].map(item => [item.uri, item])).values())
        );
      })
      .catch(error => {
        commonErrorHandler(ContentType.Quiz, error);
        commonErrorHandler(ContentType.Resources, error); // Link resource error to quiz error
      })
      .finally(() => setIsLoading(prev => ({ ...prev, [ContentType.Quiz]: false, [ContentType.Resources]: false })));

  }, [query, coursePlan, geminiService]);

  const overallLoading = Object.values(isLoading).some(status => status);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 selection:bg-amber-500 selection:text-slate-900">
      <Header />
      <main className="w-full max-w-6xl mt-6 flex flex-col gap-8">
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl grid md:grid-cols-2 gap-6">
          <CourseInput coursePlan={coursePlan} setCoursePlan={setCoursePlan} />
          <QueryInput query={query} setQuery={setQuery} onSubmit={handleGenerate} isLoading={overallLoading} />
        </div>

        {overallLoading && !notes && !flashcards.length && !quizQuestions.length && (
           <div className="flex justify-center items-center py-10">
             <LoadingSpinner size={12} /> 
             <p className="ml-4 text-lg">Generating your study aids...</p>
           </div>
        )}
        
        {(!overallLoading || notes || flashcards.length || quizQuestions.length || Object.values(errors).some(e => e)) && (
          <ResultsDisplay
            notes={notes}
            flashcards={flashcards}
            quizQuestions={quizQuestions}
            externalResources={externalResources}
            groundingAttributions={groundingAttributions}
            isLoading={isLoading}
            errors={errors}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setQuizQuestions={setQuizQuestions}
          />
        )}
      </main>
      <footer className="w-full max-w-6xl mt-12 py-6 text-center text-slate-500 border-t border-slate-700">
        College Circle &copy; {new Date().getFullYear()} - Your AI Study Partner
      </footer>
    </div>
  );
};

export default App;
