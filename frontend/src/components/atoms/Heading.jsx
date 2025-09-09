import React from 'react'

export default function Heading({ children, className = '' }) {
  return <h1 className={`heading-xl ${className}`}>{children}</h1>
}
