import type { FC, ReactNode } from 'react';

import { Logo } from '@/shared/ui/Logo/Logo';

import styles from './authContainer.module.scss';

interface AuthContainer {
  children: ReactNode;
}

const AuthContainer: FC<AuthContainer> = ({ children }) => {
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

export default AuthContainer;
