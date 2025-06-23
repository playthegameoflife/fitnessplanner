
import React, { useState }
from 'react';
import { EducationalArticle } from '../types';
import { EDUCATIONAL_TOPICS, BookIcon } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';

interface EducationalContentSectionProps {
  onGenerateArticle: (topic: string) => Promise<EducationalArticle | null>;
}

// A simple markdown parser (very basic, only handles paragraphs, headings, lists for now)
const SimpleMarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const elements = lines.map((line, index) => {
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-semibold text-sky-300 mt-4 mb-2">{line.substring(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold text-sky-400 mt-5 mb-3">{line.substring(2)}</h1>;
    }
    if (line.startsWith('- ')) {
      // Basic list item handling
      return <li key={index} className="text-slate-300 ml-4">{line.substring(2)}</li>;
    }
    if (line.trim() === '') {
      return null; // Skip empty lines for cleaner <p> spacing
    }
    return <p key={index} className="text-slate-300 mb-3">{line}</p>;
  });

  // Group consecutive list items
  const groupedElements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  elements.forEach((el, index) => {
    if (el && (el as React.ReactElement).type === 'li') {
      currentListItems.push(el);
    } else {
      if (currentListItems.length > 0) {
        groupedElements.push(<ul key={`ul-${index}`} className="list-disc space-y-1 my-3">{currentListItems}</ul>);
        currentListItems = [];
      }
      if (el) { // Add non-list items if they are not null
         groupedElements.push(el);
      }
    }
  });
  if (currentListItems.length > 0) {
     groupedElements.push(<ul key="ul-last" className="list-disc space-y-1 my-3">{currentListItems}</ul>);
  }

  return <>{groupedElements}</>;
};


export const EducationalContentSection: React.FC<EducationalContentSectionProps> = ({ onGenerateArticle }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(EDUCATIONAL_TOPICS[0]);
  const [article, setArticle] = useState<EducationalArticle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setError(null);
    setArticle(null);
    try {
      const generatedArticle = await onGenerateArticle(selectedTopic);
      setArticle(generatedArticle);
    } catch (err) {
      setError('Failed to generate article. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-800 rounded-xl shadow-xl">
      <div className="text-center mb-8">
        <BookIcon className="w-12 h-12 text-sky-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-sky-400 tracking-tight">Learn & Grow</h1>
        <p className="mt-2 text-md text-slate-300 max-w-2xl mx-auto">Expand your fitness knowledge with AI-generated articles.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 p-4 bg-slate-700 rounded-lg">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full sm:flex-grow p-3 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        >
          {EDUCATIONAL_TOPICS.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !selectedTopic}
          className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-500 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          {isLoading ? 'Generating...' : 'Get Article'}
        </button>
      </div>

      {isLoading && <LoadingSpinner text="Fetching knowledge..." />}
      {error && <p className="text-red-400 text-center">{error}</p>}
      
      {article && (
        <div className="p-6 bg-slate-750 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4">{article.title}</h2>
          <div className="prose prose-sm sm:prose-base prose-invert max-w-none"> {/* Tailwind Typography for markdown styling */}
            <SimpleMarkdownRenderer markdown={article.content} />
          </div>
        </div>
      )}
       {!article && !isLoading && !error && (
         <p className="text-slate-400 text-center py-8">Select a topic and click "Get Article" to learn something new!</p>
       )}
    </div>
  );
};
