import type { FC, AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import styles from './Link.module.scss';

type BaseLinkProps = {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  underline?: 'none' | 'hover' | 'always';
  disabled?: boolean;
  children: ReactNode;
};

type ExternalLinkProps = BaseLinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: never;
    external?: true;
  };

type InternalLinkProps = BaseLinkProps &
  Omit<RouterLinkProps, 'to'> & {
    to: string;
    external?: false;
  };

export type LinkProps = ExternalLinkProps | InternalLinkProps;

export const Link: FC<LinkProps> = ({
  variant = 'default',
  size = 'md',
  underline = 'hover',
  disabled = false,
  children,
  className = '',
  to,
  external = false,
  ...props
}) => {
  const linkClasses = [
    styles.link,
    styles[variant],
    styles[size],
    styles[`underline-${underline}`],
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (disabled) {
    return (
      <span className={linkClasses} aria-disabled="true">
        {children}
      </span>
    );
  }

  if (to && !external) {
    return (
      <RouterLink to={to} className={linkClasses} {...(props as RouterLinkProps)}>
        {children}
      </RouterLink>
    );
  }

  return (
    <a
      className={linkClasses}
      {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      {...(external && props.href && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  );
};
