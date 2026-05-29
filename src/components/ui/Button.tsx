import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-light shadow-sm hover:shadow-glow',
  secondary: 'surface text-ink dark:text-d-ink hover:border-brand/40',
  ghost:
    'text-sub dark:text-d-sub hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-d-ink',
  danger: 'bg-st-descartado/90 text-white hover:bg-st-descartado',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', className = '', ...rest }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  ),
)
Button.displayName = 'Button'
