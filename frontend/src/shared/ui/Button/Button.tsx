import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import type { IconType } from 'react-icons';

import styles from './button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} disabled={isDisabled} {...props}>
      {loading && <span className={styles.spinner} />}

      {!loading && Icon && iconPosition === 'left' && <Icon className={styles.iconLeft} />}

      {children && <span className={styles.content}>{children}</span>}

      {!loading && Icon && iconPosition === 'right' && <Icon className={styles.iconRight} />}
    </button>
  );
};
