
import React from 'react';
import { Button } from './Button';
import { SparklesIcon } from './icons/SparklesIcon';

interface QueryInputProps {
  query: string;
  setQuery: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const QueryInput: React.FC<QueryInputProps> = ({ query, setQuery, onSubmit, isLoading }) => {
  return (
    <div className="flex flex-col space-y-3">
      <label htmlFor="query" className="block text-lg font-semibold text-slate-200">
        Your Query / Topic
      </label>
      <textarea
        id="query"
        rows={8}
        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-slate-400 text-slate-100 resize-none"
        placeholder="e.g., 'Explain photosynthesis', 'Key concepts from Chapter 3 on Thermodynamics', 'What are the main themes in Hamlet?'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button 
        onClick={onSubmit} 
        disabled={isLoading || !query.trim()}
        className="w-full flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            Generate Study Aids
          </>
        )}
      </Button>
    </div>
  );
};
