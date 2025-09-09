import React from 'react';
import QuoteGenerator from '../components/organisms/QuoteGenerator';
import Wrapper from '../components/atoms/Wrapper';

export default function Home() {
  return (
    <Wrapper>
      <QuoteGenerator />
    </Wrapper>
  );
}
