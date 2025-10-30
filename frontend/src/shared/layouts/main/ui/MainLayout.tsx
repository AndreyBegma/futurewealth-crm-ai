import type { FC, ReactNode } from 'react';

import styles from './mainLayout.module.scss';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default MainLayout;
