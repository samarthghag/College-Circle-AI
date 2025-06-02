
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import { QuizItem } from './QuizItem';
import { Button } from './Button';

interface QuizSectionProps {
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ questions, setQuestions }) => {
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return <p className="text-slate-400 p-4">No quiz questions available.</p>;
  }

  const handleAnswerSelect = (questionId: string, selectedOption: string) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? { ...q, userAnswer: selectedOption, isCorrect: undefined } : q
      )
    );
    setShowResults(false); // Reset results view if an answer is changed
  };

  const handleSubmitQuiz = () => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => ({
        ...q,
        isCorrect: q.userAnswer === q.correctAnswer,
      }))
    );
    setShowResults(true);
  };
  
  const score = questions.filter(q => q.isCorrect).length;
  const totalAttempted = questions.filter(q => q.userAnswer !== undefined).length;


  return (
    <div className="py-4 space-y-8">
      {questions.map((question, index) => (
        <QuizItem 
          key={question.id} 
          question={question} 
          questionNumber={index + 1}
          onAnswerSelect={handleAnswerSelect}
          showResult={showResults}
        />
      ))}
      <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button onClick={handleSubmitQuiz} disabled={totalAttempted !== questions.length}>
          {showResults ? 'Re-check Answers' : 'Submit Answers'}
        </Button>
        {showResults && (
          <p className="text-xl font-semibold">
            Your Score: <span className={score > questions.length / 2 ? "text-green-400" : "text-red-400"}>{score}</span> / {questions.length}
          </p>
        )}
      </div>
    </div>
  );
};
