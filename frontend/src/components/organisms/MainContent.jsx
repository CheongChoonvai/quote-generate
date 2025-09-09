import React from 'react';
import QuoteCard from '../molecules/QuoteCard';
import QuoteForm from '../molecules/QuoteForm';

const MainContent = ({
  currentQuote,
  error,
  generateQuote,
  isLoading,
  selectedType,
  setSelectedType,
}) => {
  return (
    <div className="space-y-8">
      <div>
        {currentQuote ? (
          <QuoteCard
            quote={currentQuote.quote}
            author={currentQuote.author}
            source={currentQuote.source}
            thinking={currentQuote.thinking}
          />
        ) : (
          <div className="card">
            <div className="h-6 bg-gray-700 rounded mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="mt-4 text-gray-400 text-center font-medium">
              ⚡ Ready to generate epic quotes ⚡
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border-2 border-red-500/50 text-red-300 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xl">⚠️</span>
              <strong className="font-bold uppercase tracking-wider">Error:</strong>
            </div>
            <div className="mt-2">{error}</div>
          </div>
        )}
      </div>

      <div>
        <QuoteForm
          onGenerate={generateQuote}
          isLoading={isLoading}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>
    </div>
  );
};

export default MainContent;
