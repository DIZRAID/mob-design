import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'affirm' | 'destroy' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'mob-btn--primary',
  secondary: 'mob-btn--secondary',
  ghost: 'mob-btn--ghost',
  quiet: 'mob-btn--quiet',
  affirm: 'mob-btn--affirm',
  destroy: 'mob-btn--destroy',
  danger: 'mob-btn--danger',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'mob-btn--sm',
  md: 'mob-btn--md',
  lg: 'mob-btn--lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    iconStart,
    iconEnd,
    className,
    children,
    disabled,
    type = 'button',
    onClick,
    'aria-disabled': ariaDisabled,
    'aria-busy': ariaBusy,
    ...nativeProps
  },
  ref,
) {
  const classes = ['mob-btn', variantClass[variant], sizeClass[size], className].filter(Boolean).join(' ');
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (ariaDisabled === true || ariaDisabled === 'true') {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...nativeProps}
      ref={ref}
      type={type}
      className={classes}
      disabled={Boolean(disabled || loading)}
      aria-disabled={ariaDisabled}
      aria-busy={loading || ariaBusy || undefined}
      data-mob-loading={loading ? '' : undefined}
      onClick={handleClick}
    >
      {iconStart ? <span className="mob-btn__icon" aria-hidden="true">{iconStart}</span> : null}
      <span className="mob-btn__label">{children}</span>
      {iconEnd ? <span className="mob-btn__icon" aria-hidden="true">{iconEnd}</span> : null}
    </button>
  );
});

Button.displayName = 'Button';
