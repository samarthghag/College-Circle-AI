
import React from 'react';
import type { QuizQuestion } from '../types';

interface QuizItemProps {
  question: QuizQuestion;
  questionNumber: number;
  onAnswerSelect: (questionId: string, selectedOption: string) => void;
  showResult: boolean;
}

export const QuizItem: React.FC<QuizItemProps> = ({ question, questionNumber, onAnswerSelect, showResult }) => {
  return (
    <div className="bg-slate-700 p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-amber-400 mb-3">
        Question {questionNumber}: <span className="text-slate-100">{question.question}</span>
      </h4>
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionId = `${question.id}-option-${index}`;
          const isSelected = question.userAnswer === option;
          const isCorrect = option === question.correctAnswer;

          let optionClasses = "w-full text-left p-3 rounded-md border transition-all duration-150 ease-in-out ";
          if (showResult) {
            if (isCorrect) {
              optionClasses += "bg-green-500/30 border-green-500 text-green-300 ";
            } else if (isSelected && !isCorrect) {
              optionClasses += "bg-red-500/30 border-red-500 text-red-300 ";
            } else {
              optionClasses += "bg-slate-600 border-slate-500 hover:bg-slate-500 text-slate-200 ";
            }
          } else {
             optionClasses += isSelected 
              ? "bg-amber-600 border-amber-500 text-white " 
              : "bg-slate-600 border-slate-500 hover:bg-slate-500 text-slate-200 ";
          }

          return (
            <button
              key={optionId}
              onClick={() => onAnswerSelect(question.id, option)}
              className={optionClasses}
              disabled={showResult} // Disable after submitting results
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          );
        })}
      </div>
      {showResult && question.isCorrect !== undefined && (
        <div className={`mt-4 p-3 rounded-md text-sm ${question.isCorrect ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
          {question.isCorrect ? 'Correct!' : `Incorrect. Correct answer: ${question.correctAnswer}`}
          {question.explanation && <p className="mt-1 text-xs text-slate-300">Explanation: {question.explanation}</p>}
        </div>
      )}
    </div>
  );
};
