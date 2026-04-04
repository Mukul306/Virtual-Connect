import React from 'react';

export default function Button({ 
    children, 
    onClick, 
    variant = 'primary', 
    type = 'button', 
    className = '', 
    disabled = false,
    ...props 
}) {
    const baseStyles = "inline-flex justify-center items-center px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md focus:ring-primary",
        secondary: "bg-white border border-accent hover:bg-accent-lighter text-textMain shadow-sm focus:ring-accent",
        danger: "bg-white border border-red-200 hover:bg-red-50 text-red-600 shadow-sm focus:ring-red-500",
        ghost: "bg-transparent hover:bg-accent-lighter text-textMain focus:ring-accent"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
