import { useEffect } from 'react';
import useUser from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return children;
}
