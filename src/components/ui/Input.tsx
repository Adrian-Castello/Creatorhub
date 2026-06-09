import { type InputHTMLAttributes, forwardRef } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, prefix, suffix, className = '', type, ...rest }, ref) => (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      )}
      <div
        className={`flex items-center surface rounded-xl px-3 h-10 transition-colors focus-within:border-brand/60 ${
          error ? '!border-st-descartado/60' : ''
        }`}
      >
        {prefix && <span className="text-muted text-sm mr-1 shrink-0">{prefix}</span>}
        <input
          ref={ref}
          type={type}
          className={`min-w-0 flex-1 bg-transparent outline-none text-sm placeholder:text-muted tnum no-spin ${className}`}
          {...rest}
        />
        {suffix && <span className="text-muted text-sm ml-1.5 shrink-0">{suffix}</span>}
      </div>
      {error && <span className="mt-1 block text-xs text-st-descartado">{error}</span>}
    </label>
  ),
)
Input.displayName = 'Input'
