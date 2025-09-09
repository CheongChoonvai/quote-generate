import React from 'react';
import useQuoteGenerator from '../../hooks/useQuoteGenerator';
import Layout from './Layout';

export default function QuoteGenerator() {
  const {
    currentQuote,
    history,
    isLoading,
    ollamaStatus,
    selectedType,
    activeTab,
    error,
    setActiveTab,
    generateQuote,
    setSelectedType,
    selectFromHistory,
    copyToClipboard,
    clearHistory,
  } = useQuoteGenerator();

  return (
    <Layout
      ollamaStatus={ollamaStatus}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentQuote={currentQuote}
      error={error}
      generateQuote={generateQuote}
      isLoading={isLoading}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      history={history}
      selectFromHistory={selectFromHistory}
      copyToClipboard={copyToClipboard}
      clearHistory={clearHistory}
    />
  );
}
