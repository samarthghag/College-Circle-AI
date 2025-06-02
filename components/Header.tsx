
import React from 'react';
import { AtomLogo } from './icons/AtomLogo';

export const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center justify-center text-center py-4 w-full">
      <AtomLogo className="h-20 w-20 text-amber-500 mb-3" />
      <h1 className="text-4xl font-bold text-slate-100 tracking-tight">
        College <span className="text-amber-500">Circle</span>
      </h1>
      <p className="text-slate-400 mt-1 text-lg">Your AI-Powered Study Companion</p>
    </header>
  );
};
