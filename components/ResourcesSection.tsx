
import React from 'react';
import type { ExternalResource, GroundingAttribution } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface ResourcesSectionProps {
  resources: ExternalResource[];
  groundingAttributions: GroundingAttribution[];
}

const ResourceCard: React.FC<{ title: string; uri: string; type?: string; source?: string }> = ({ title, uri, type, source }) => (
  <a
    href={uri}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-slate-700 hover:bg-slate-600 p-4 rounded-lg shadow transition-all duration-150 ease-in-out"
  >
    <h4 className="text-md font-semibold text-amber-400 flex items-center">
      <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
      {title || 'Untitled Resource'}
    </h4>
    <p className="text-xs text-slate-400 truncate mt-1" title={uri}>{uri}</p>
    {type && <span className="text-xs mt-1 inline-block bg-slate-500 text-slate-200 px-2 py-0.5 rounded-full">{type}</span>}
    {source && <span className="text-xs mt-1 ml-1 inline-block bg-amber-700 text-amber-100 px-2 py-0.5 rounded-full">{source}</span>}
  </a>
);

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources, groundingAttributions }) => {
  const allResources = [
    ...resources.map(r => ({ ...r, source: 'AI Suggested' })),
    // Fix: Ensure objects from groundingAttributions have a 'type' property for consistent object shape.
    // This prevents TypeScript errors when 'item.type' is accessed later (e.g. on line 51 of original file).
    // Original line: ...groundingAttributions.map(ga => ({ ...ga, source: 'Web Search Result' }))
    ...groundingAttributions.map(ga => ({ 
      uri: ga.uri, 
      title: ga.title, 
      type: undefined, // Explicitly add 'type' property, making it undefined for these items
      source: 'Web Search Result' 
    }))
  ];

  // Deduplicate based on URI
  const uniqueResources = Array.from(new Map(allResources.map(item => [item.uri, item])).values());


  if (uniqueResources.length === 0) {
    return <p className="text-slate-400 p-4">No external resources or attributions available.</p>;
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-semibold text-slate-100 mb-4">Learning Resources & Citations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniqueResources.map((item, index) => (
          <ResourceCard 
            key={`${item.uri}-${index}`} 
            title={item.title} 
            uri={item.uri} 
            type={item.type}
            source={item.source}
          />
        ))}
      </div>
    </div>
  );
};
