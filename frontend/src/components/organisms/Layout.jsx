import React from 'react';
import Header from './Header';
import MainContent from './MainContent';
import HistoryList from '../molecules/HistoryList';

const Layout = ({
  ollamaStatus,
  currentQuote,
  error,
  generateQuote,
  isLoading,
  selectedType,
  setSelectedType,
  history,
  selectFromHistory,
  copyToClipboard,
  clearHistory,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Header ollamaStatus={ollamaStatus} />
        <MainContent
          currentQuote={currentQuote}
          error={error}
          generateQuote={generateQuote}
          isLoading={isLoading}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      </div>
      <div className="lg:col-span-1">
        <HistoryList
          items={history}
          onSelect={selectFromHistory}
          onCopy={copyToClipboard}
          onClear={clearHistory}
        />
      </div>
    </div>
  );
};

export default Layout;
