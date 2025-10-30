import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { IconType } from 'react-icons';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import styles from './TextField.module.scss';

type BaseProps = {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: IconType;
  endIcon?: IconType;
  showPasswordToggle?: boolean;
  inputType?: string;
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
    rows?: number;
  };

export type TextFieldProps = InputProps | TextareaProps;

export const TextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>((props, ref) => {
  const {
    label,
    error,
    helperText,
    fullWidth = true,
    variant = 'outlined',
    size = 'md',
    startIcon: StartIcon,
    endIcon: EndIcon,
    showPasswordToggle = false,
    inputType: customInputType,
    disabled,
    className = '',
    id,
    required,
    multiline = false,
    ...restProps
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || `textfield-${label?.toLowerCase().replace(/\s/g, '-')}`;

  const htmlType = !multiline && 'type' in restProps ? restProps.type : undefined;
  const baseType = customInputType || htmlType || 'text';
  const isPasswordField = baseType === 'password';
  const finalInputType = showPasswordToggle && isPasswordField && showPassword ? 'text' : baseType;

  const wrapperClasses = [
    styles.wrapper,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    styles.label,
    error && styles.labelError,
    isFocused && !error && styles.labelFocused,
    disabled && styles.labelDisabled,
  ]
    .filter(Boolean)
    .join(' ');

  const inputWrapperClasses = [
    styles.inputWrapper,
    styles[variant],
    styles[size],
    error && styles.error,
    disabled && styles.disabled,
    isFocused && styles.focused,
    StartIcon && styles.hasStartIcon,
    (EndIcon || (showPasswordToggle && isPasswordField)) && styles.hasEndIcon,
  ]
    .filter(Boolean)
    .join(' ');

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if ('onFocus' in restProps && restProps.onFocus) {
      restProps.onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if ('onBlur' in restProps && restProps.onBlur) {
      restProps.onBlur(e);
    }
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={inputWrapperClasses}>
        {StartIcon && <StartIcon className={styles.startIcon} />}

        {multiline ? (
          <textarea
            ref={ref as any}
            id={inputId}
            disabled={disabled}
            className={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as any}
            id={inputId}
            type={finalInputType}
            disabled={disabled}
            className={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {showPasswordToggle && isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.toggleButton}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}

        {EndIcon && !showPasswordToggle && (
          <EndIcon className={styles.endIcon} />
        )}
      </div>

      {(error || helperText) && (
        <p className={error ? styles.helperError : styles.helper}>
          {error && <FiAlertCircle className={styles.errorIcon} />}
          <span>{error || helperText}</span>
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';
