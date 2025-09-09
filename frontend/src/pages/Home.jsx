import React from 'react'
import QuoteGenerator from '../components/organisms/QuoteGenerator'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <QuoteGenerator />
      </div>
    </div>
  )
}
