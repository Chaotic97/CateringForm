import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id ?? rest.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium font-body text-text-main"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border bg-white px-4 py-2.5 font-body text-text-main placeholder:text-muted transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            error
              ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
              : 'border-border',
            rest.disabled ? 'opacity-50 cursor-not-allowed bg-surface' : '',
            className,
          ].join(' ')}
          {...rest}
        />
        {error && (
          <p className="text-sm text-red-600 font-body">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
