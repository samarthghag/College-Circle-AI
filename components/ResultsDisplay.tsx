
import React from 'react';
import type { Flashcard, QuizQuestion, ExternalResource, GroundingAttribution } from '../types';
import { ContentType } from '../types';
import { NotesSection } from './NotesSection';
import { FlashcardsSection } from './FlashcardsSection';
import { QuizSection } from './QuizSection';
import { ResourcesSection } from './ResourcesSection';
import { LoadingSpinner } from './LoadingSpinner';

interface ResultsDisplayProps {
  notes: string | null;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  externalResources: ExternalResource[];
  groundingAttributions: GroundingAttribution[];
  isLoading: { [key in ContentType]?: boolean };
  errors: { [key in ContentType]?: string | null };
  activeTab: ContentType;
  setActiveTab: (tab: ContentType) => void;
  setQuizQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasError?: boolean;
  isLoading?: boolean;
}> = ({ label, isActive, onClick, hasError, isLoading }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm sm:text-base font-medium rounded-t-lg focus:outline-none transition-all duration-200 ease-in-out
                ${isActive ? 'bg-slate-700 text-amber-400 border-b-2 border-amber-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                ${hasError ? 'text-red-400' : ''}
                ${isLoading ? 'animate-pulse' : ''}
              `}
  >
    {label} {isLoading && <span className="text-xs">(loading...)</span>}
  </button>
);


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  notes,
  flashcards,
  quizQuestions,
  externalResources,
  groundingAttributions,
  isLoading,
  errors,
  activeTab,
  setActiveTab,
  setQuizQuestions
}) => {
  
  const renderContent = () => {
    const currentTypeLoading = isLoading[activeTab];
    const currentTypeError = errors[activeTab];

    if (currentTypeLoading) {
      return <div className="flex justify-center items-center py-10"><LoadingSpinner size={8} /><p className="ml-3">Loading {activeTab}...</p></div>;
    }
    if (currentTypeError) {
      return <div className="text-red-400 p-4 bg-red-900/30 rounded-md">Error loading {activeTab}: {currentTypeError}</div>;
    }

    switch (activeTab) {
      case ContentType.Notes:
        return notes ? <NotesSection notes={notes} /> : <p className="text-slate-400 p-4">No notes generated yet or an error occurred.</p>;
      case ContentType.Flashcards:
        return flashcards.length > 0 ? <FlashcardsSection flashcards={flashcards} /> : <p className="text-slate-400 p-4">No flashcards generated yet or an error occurred.</p>;
      case ContentType.Quiz:
        return quizQuestions.length > 0 ? <QuizSection questions={quizQuestions} setQuestions={setQuizQuestions} /> : <p className="text-slate-400 p-4">No quiz generated yet or an error occurred.</p>;
      case ContentType.Resources:
        return (externalResources.length > 0 || groundingAttributions.length > 0) ? 
               <ResourcesSection resources={externalResources} groundingAttributions={groundingAttributions} /> : 
               <p className="text-slate-400 p-4">No external resources or attributions found yet.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 p-0 sm:p-6 rounded-lg shadow-xl mt-2 w-full">
      <div className="border-b border-slate-700 mb-0 sm:mb-1 flex flex-wrap">
        <TabButton label="Notes" isActive={activeTab === ContentType.Notes} onClick={() => setActiveTab(ContentType.Notes)} hasError={!!errors.notes} isLoading={isLoading.notes} />
        <TabButton label="Flashcards" isActive={activeTab === ContentType.Flashcards} onClick={() => setActiveTab(ContentType.Flashcards)} hasError={!!errors.flashcards} isLoading={isLoading.flashcards}/>
        <TabButton label="Quiz" isActive={activeTab === ContentType.Quiz} onClick={() => setActiveTab(ContentType.Quiz)} hasError={!!errors.quiz} isLoading={isLoading.quiz}/>
        <TabButton label="Resources" isActive={activeTab === ContentType.Resources} onClick={() => setActiveTab(ContentType.Resources)} hasError={!!errors.resources} isLoading={isLoading.resources}/>
      </div>
      <div className="p-4 sm:p-0 min-h-[200px]">
        {renderContent()}
      </div>
    </div>
  );
};
