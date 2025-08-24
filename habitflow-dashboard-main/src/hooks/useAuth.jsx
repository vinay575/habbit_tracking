import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { setAuth } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        dispatch(setAuth({ 
          user: session?.user ?? null, 
          session 
        }));
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setAuth({ 
        user: session?.user ?? null, 
        session 
      }));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);
};