import type { FC, ReactNode } from 'react';

import { FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi';

import styles from './alert.module.scss';

export type AlertType = 'info' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
  className?: string;
}

export const Alert: FC<AlertProps> = ({ type = 'info', children, className = '' }) => {
  const iconMap = {
    info: FiInfo,
    warning: FiAlertTriangle,
    error: FiXCircle,
  };

  const Icon = iconMap[type];

  return (
    <div className={`${styles.container} ${styles[type]} ${className}`}>
      <span className={styles.icon}>
        <Icon />
      </span>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
