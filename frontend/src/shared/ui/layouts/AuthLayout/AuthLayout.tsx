import type { FC, ReactNode } from 'react';

import { Logo } from '@/shared/ui/Logo/Logo';

import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.container__left}>
        <Logo size="lg" clickable={false} />
        {children}
      </div>
      <div className={styles.container__right}></div>
    </div>
  );
};
