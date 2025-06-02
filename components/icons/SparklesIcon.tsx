
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 3L9.88 7.12L6 9L9.88 10.88L12 15L14.12 10.88L18 9L14.12 7.12L12 3Z"/>
    <path d="M3 12L4.94 13.94L7 12L4.94 10.06L3 12Z"/>
    <path d="M17 12L19.06 13.94L21 12L19.06 10.06L17 12Z"/>
  </svg>
);
