
import React, { useState } from 'react';
import type { Flashcard } from '../types';
import { RefreshCwIcon } from './icons/RefreshCwIcon'; // Assuming you have this icon

interface FlashcardItemProps {
  flashcard: Flashcard;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="bg-slate-700 rounded-lg shadow-lg p-6 h-64 min-h-full flex flex-col justify-between cursor-pointer group perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full preserve-3d duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center p-4">
          <h3 className="text-lg font-semibold text-amber-400 mb-2 text-center">Question</h3>
          <p className="text-slate-100 text-center leading-snug">{flashcard.question}</p>
        </div>
        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-center items-center p-4 bg-slate-600 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2 text-center">Answer</h3>
          <p className="text-slate-100 text-center leading-snug">{flashcard.answer}</p>
        </div>
      </div>
      <button 
        className="absolute bottom-3 right-3 text-slate-400 hover:text-amber-400 transition-colors opacity-50 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card flip when clicking button
          setIsFlipped(!isFlipped);
        }}
        title="Flip card"
      >
        <RefreshCwIcon className="w-5 h-5" />
      </button>
      {/* Fix: Removed <style jsx global> block from here (originally at line 40).
          The 'jsx' and 'global' attributes are non-standard for the <style> tag
          in a typical React setup without a framework like Next.js, and were causing a TypeScript error.
          The CSS utility classes defined ('perspective', 'preserve-3d', 'rotate-y-180', 'backface-hidden')
          are assumed to be provided by the project's Tailwind CSS configuration or a global stylesheet.
      */}
    </div>
  );
};
