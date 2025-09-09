import React from 'react'

export default function Button({ children, onClick, variant = 'primary', size = 'normal', className = '', ...props }) {
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const sizeClass = size === 'large' ? 'btn-large' : 'btn-normal';
  
  return (
    <button onClick={onClick} className={`btn ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
