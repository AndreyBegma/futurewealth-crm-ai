import { useEffect } from 'react';

import { selectCurrentUser, selectIsAuthenticated } from '@/entities/user';
import { fetchCurrentUserThunk } from '@/entities/user/model/thunks';

import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';

const UseInitSession = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (isAuthenticated && currentUser === null) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [isAuthenticated, currentUser]);
};

export default UseInitSession;
