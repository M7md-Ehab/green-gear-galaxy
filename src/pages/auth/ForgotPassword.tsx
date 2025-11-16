import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login since we use passwordless OTP
    navigate('/login');
  }, [navigate]);

  return null;
};

export default ForgotPassword;
