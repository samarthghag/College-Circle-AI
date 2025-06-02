import React from 'react';

interface CourseInputProps {
  coursePlan: string;
  setCoursePlan: (value: string) => void;
}

export const CourseInput: React.FC<CourseInputProps> = ({ coursePlan, setCoursePlan }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const txtMdRegex = /\.(txt|md)$/i;
      const complexFormatRegex = /\.(pdf|doc|docx|rtf)$/i;

      if (txtMdRegex.test(file.name)) {
        try {
          const text = await file.text();
          setCoursePlan(text);
        } catch (e) {
          console.error("Error reading text file:", e);
          alert("Could not read this file. Please try pasting the content directly.");
          setCoursePlan('');
        }
      } else if (complexFormatRegex.test(file.name)) {
        setCoursePlan(''); // Clear existing plan as we are not auto-processing this file
        alert(`For ${file.name.split('.').pop()?.toUpperCase()} files, please manually copy and paste the relevant text from your course plan into the text area above. Automatic extraction for this format is not performed to ensure accuracy and manage content size.`);
        // Reset the file input so the user can re-select if needed, or to clear the displayed filename
        event.target.value = ''; 
      } else {
        alert("Unsupported file type. Please upload a .txt or .md file for automatic text extraction, or manually copy and paste content from PDF, DOC, DOCX, or RTF files.");
        event.target.value = '';
      }
    }
  };
  
  return (
    <div className="flex flex-col space-y-3">
      <label htmlFor="coursePlan" className="block text-lg font-semibold text-slate-200">
        Course Plan <span className="text-sm text-slate-400">(Optional)</span>
      </label>
      <textarea
        id="coursePlan"
        rows={8}
        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-slate-400 text-slate-100 resize-none"
        placeholder="Paste relevant sections of your course plan here (e.g., syllabus topics, learning objectives, key references)..."
        value={coursePlan}
        onChange={(e) => setCoursePlan(e.target.value)}
        aria-describedby="course-plan-guidance"
      />
      <div className="text-sm text-slate-400">
        Or upload a simple text file (.txt, .md):
        <input 
          type="file" 
          accept=".txt,.md,.pdf,.doc,.docx,.rtf" // Keep accept broad to allow selection, but logic handles specific types
          onChange={handleFileChange}
          className="ml-2 text-sm text-amber-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
        />
         <p id="course-plan-guidance" className="text-xs text-slate-500 mt-1">
          For PDF, Word (DOC/DOCX), or RTF files, please <strong>copy & paste relevant text</strong> into the area above. This ensures the most important information is used and avoids processing errors with very large or complex files.
        </p>
      </div>
    </div>
  );
};