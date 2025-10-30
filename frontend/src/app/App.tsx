import type { FC } from 'react';

import { RouterProvider } from './providers/RouterProvider';
import StoreProvider from './providers/StoreProvider';

const App: FC = () => {
  return (
    <main>
      <StoreProvider>
        <RouterProvider />
      </StoreProvider>
    </main>
  );
};

export default App;
