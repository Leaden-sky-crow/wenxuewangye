
import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null;
  }

  const needsTruncation = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="text-gray-300 leading-relaxed font-serif mt-4">
      <p className="whitespace-pre-wrap">{displayText}{!isExpanded && needsTruncation && '...'}</p>
      {needsTruncation && (
        <button
          onClick={toggleExpand}
          className="text-sm text-gray-400 hover:underline mt-2 font-sans"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      )}
    </div>
  );
};
