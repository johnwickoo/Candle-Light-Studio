import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VERIFICATION_ENDPOINT = import.meta.env.VITE_EMAILVERIFIER_FUNCTION_URL;

function VerifyEmail() {
  const [status, setStatus] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (!token) {
      navigate('/verificationerror?msg=missing_token', { replace: true });
      return;
    }

    const verifyToken = async () => {
      try {
        const url = `${VERIFICATION_ENDPOINT}?token=${token}`;
        
        // 💡 Use fetch to get the JSON response
        const response = await fetch(url);
        const data = await response.json(); 

        if (response.ok && data.status === 'success') {
            // Navigate based on the JSON response
            navigate(data.redirectTo || '/book', { replace: true });
        } else {
            // Navigate to error page using the code provided by the backend
            const errorCode = data.code || 'unknown_error';
            navigate(`/verificationerror?msg=${errorCode}`, { replace: true });
        }
      } catch (error) {
        console.error("Verification API call failed:", error);
        navigate('/verificationerror?msg=network_error', { replace: true });
      }
    };

    verifyToken();

  }, [navigate]);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>⏳ {status}</h2>
      <p>Confirming your account...</p>
    </div>
  );
}

export default VerifyEmail;