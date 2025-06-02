
import React from 'react';
import Markdown from 'react-markdown'; // Using react-markdown for rich text
import remarkGfm from 'remark-gfm';   // For GitHub Flavored Markdown (tables, strikethrough, etc.)

interface NotesSectionProps {
  notes: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes }) => {
  return (
    <div className="prose prose-sm sm:prose-base prose-invert max-w-none p-1 py-4 sm:p-4 bg-slate-800 rounded-b-lg leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm]}>
        {notes}
      </Markdown>
    </div>
  );
};
