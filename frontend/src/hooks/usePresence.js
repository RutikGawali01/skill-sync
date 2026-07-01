import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useWebSocket from './useWebSocket';
import { setUserPresence } from '../redux/presenceSlice';

/**
 * Hook to manage real-time online presence status listening.
 */
const usePresence = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (!token) return;

    // Subscribe to presence queue
    const unsubscribe = subscribe('/user/queue/chat/presence', (payload) => {
      // payload structure: { userId: 123, status: 'ONLINE' | 'OFFLINE' }
      if (payload && payload.userId && payload.status) {
        dispatch(
          setUserPresence({
            userId: payload.userId,
            online: payload.status === 'ONLINE',
          })
        );
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [token, subscribe, dispatch]);
};

export default usePresence;
