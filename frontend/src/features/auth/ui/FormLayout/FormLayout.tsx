import type { FC, FormEventHandler, ReactNode } from 'react';

import { ROUTES } from '@/shared/config';
import { Alert } from '@/shared/ui/Alert/Alert';
import { Link } from '@/shared/ui/Link/Link';

import styles from './formLayout.module.scss';

interface FormLayoutProps {
  title: string;
  children: ReactNode;
  type: 'sign-in' | 'sign-up';
  onSubmit: FormEventHandler<HTMLFormElement>;
  error: string | null;
}

const FormLayout: FC<FormLayoutProps> = ({ title, children, onSubmit, type, error }) => {
  const linkConfigs = {
    'sign-in': {
      text: "Don't have an account?",
      linkText: 'Sign up',
      link: ROUTES.auth.register,
    },
    'sign-up': {
      text: 'Already have an account?',
      linkText: 'Sign in',
      link: ROUTES.auth.login,
    },
  };
  const currentLinkConfig = linkConfigs[type];
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.headerTitle}>{title}</h3>

        {error && <Alert type="error">{error}</Alert>}
      </header>
      <form className={styles.form} onSubmit={onSubmit}>
        {children}
      </form>
      <footer className={styles.footer}>
        <p className={styles.footerLink}>
          {currentLinkConfig.text}{' '}
          <Link to={currentLinkConfig.link}>{currentLinkConfig.linkText}</Link>
        </p>
      </footer>
    </section>
  );
};

export default FormLayout;
