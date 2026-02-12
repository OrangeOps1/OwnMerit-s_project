"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  error?: string;
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helpText?: string;
  error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helpText?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, error, id, className = "", ...props }, ref) => {
    const inputId = id || `input-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-lg font-semibold text-text-primary mb-2"
        >
          {label}
          {props.required && (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {helpText && (
          <p
            id={helpId}
            className="text-base text-text-secondary mb-3"
          >
            {helpText}
          </p>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={
            [helpId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={error ? "true" : undefined}
          className={`
            w-full px-5 py-4
            text-lg text-text-primary
            bg-surface
            border-2 rounded-xl
            transition-all duration-200
            placeholder:text-text-muted
            focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none
            ${error ? "border-danger bg-danger-light" : "border-border hover:border-text-muted"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-base text-danger font-medium flex items-center gap-2"
          >
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, helpText, error, id, className = "", ...props }, ref) => {
    const inputId = id || `textarea-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-lg font-semibold text-text-primary mb-2"
        >
          {label}
          {props.required && (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {helpText && (
          <p id={helpId} className="text-base text-text-secondary mb-3">
            {helpText}
          </p>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-describedby={
            [helpId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={error ? "true" : undefined}
          rows={4}
          className={`
            w-full px-5 py-4
            text-lg text-text-primary
            bg-surface
            border-2 rounded-xl
            transition-all duration-200
            placeholder:text-text-muted
            resize-y
            focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none
            ${error ? "border-danger bg-danger-light" : "border-border hover:border-text-muted"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-base text-danger font-medium flex items-center gap-2"
          >
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helpText, error, id, options, className = "", ...props }, ref) => {
    const inputId = id || `select-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-lg font-semibold text-text-primary mb-2"
        >
          {label}
          {props.required && (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {helpText && (
          <p id={helpId} className="text-base text-text-secondary mb-3">
            {helpText}
          </p>
        )}
        <select
          ref={ref}
          id={inputId}
          aria-describedby={
            [helpId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={error ? "true" : undefined}
          className={`
            w-full px-5 py-4
            text-lg text-text-primary
            bg-surface
            border-2 rounded-xl
            transition-all duration-200
            appearance-none
            cursor-pointer
            focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none
            ${error ? "border-danger bg-danger-light" : "border-border hover:border-text-muted"}
            ${className}
          `}
          {...props}
        >
          <option value="">Choose an option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-base text-danger font-medium flex items-center gap-2"
          >
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
