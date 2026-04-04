import React from 'react';

export default function Card({ children, className = '', noPadding = false }) {
    return (
        <div className={`bg-white border border-accent rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 ${noPadding ? '' : 'p-6 w-full max-w-md'} ${className}`}>
            {children}
        </div>
    );
}
