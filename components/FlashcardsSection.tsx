
import React from 'react';
import type { Flashcard } from '../types';
import { FlashcardItem } from './FlashcardItem';

interface FlashcardsSectionProps {
  flashcards: Flashcard[];
}

export const FlashcardsSection: React.FC<FlashcardsSectionProps> = ({ flashcards }) => {
  if (!flashcards || flashcards.length === 0) {
    return <p className="text-slate-400 p-4">No flashcards available.</p>;
  }

  return (
    <div className="py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((flashcard) => (
        <FlashcardItem key={flashcard.id} flashcard={flashcard} />
      ))}
    </div>
  );
};
