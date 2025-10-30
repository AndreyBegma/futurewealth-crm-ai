import type { FC } from 'react';

import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config';

import styles from './logo.module.scss';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  clickable?: boolean;
}

export const Logo: FC<LogoProps> = ({ size = 'md', variant = 'dark', clickable = true }) => {
  const logoClasses = [styles.logo, styles[size], styles[variant]].filter(Boolean).join(' ');

  const content = (
    <div className={logoClasses}>
      <span className={styles.logoText}>
        Future<span className={styles.logoAccent}>Wealth</span>
      </span>
    </div>
  );

  if (clickable) {
    return (
      <Link to={ROUTES.home} className={styles.logoLink}>
        {content}
      </Link>
    );
  }

  return content;
};
