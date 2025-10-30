import type { FC, ReactNode } from 'react';

import { Provider } from 'react-redux';

import store from '../store/store';

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider: FC<StoreProviderProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
export default StoreProvider;
