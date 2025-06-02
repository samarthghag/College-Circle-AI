
import React from 'react';

export const AtomLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" {...props}>
    {/* Orbits */}
    <ellipse cx="50" cy="50" rx="45" ry="20" transform="rotate(0 50 50)" />
    <ellipse cx="50" cy="50" rx="45" ry="20" transform="rotate(60 50 50)" />
    <ellipse cx="50" cy="50" rx="45" ry="20" transform="rotate(120 50 50)" />

    {/* Electrons - simple circles */}
    <circle cx="50" cy="30" r="5" fill="currentColor" stroke="none" />
    <circle cx="20.7" cy="62.5" r="5" fill="currentColor" stroke="none" /> {/* approx on 60deg rotated ellipse */}
    <circle cx="79.3" cy="62.5" r="5" fill="currentColor" stroke="none" /> {/* approx on 120deg rotated ellipse */}
    
    {/* Central Person Icon */}
    {/* Head */}
    <circle cx="50" cy="42" r="8" fill="currentColor" stroke="none" />
    {/* Body/Shoulders - a simple trapezoid or rounded rect */}
    <path d="M40 52 Q50 50 60 52 L58 65 Q50 68 42 65 Z" fill="currentColor" stroke="none" />
  </svg>
);
