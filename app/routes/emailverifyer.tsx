import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';

const VERIFICATION_ENDPOINT = import.meta.env.VITE_EMAILVERIFIER_FUNCTION_URL;

function VerifyEmail() {
  // Use state to provide clearer feedback to the user
  const [status, setStatus] = useState('Verifying your email...');
  const navigate = useNavigate();
  
  // Use useCallback to memoize the navigation function for useEffect dependencies
  const navigateToError = useCallback((errorCode: any) => {
    navigate(`/verificationerror?msg=${errorCode}`, { replace: true });
  }, [navigate]);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    // 1. Initial Token Check
    if (!token) {
      setStatus('Error: Missing verification token.');
      navigateToError('missing_token');
      return;
    }
    
    // Set status to indicate API call is starting
    setStatus('Contacting server...');

    const verifyToken = async () => {
      try {
        const url = `${VERIFICATION_ENDPOINT}?token=${token}`;
        
        // 2. Execute Backend Function (Get JSON Response)
        const response = await fetch(url);
        
        // Handle network errors before parsing JSON
        if (!response.ok) {
            // This handles HTTP errors (4xx, 5xx) that Appwrite might return 
            // before the JSON is even parsed (e.g., 404 Function Not Found).
            setStatus('Server error during verification.');
            navigateToError('server_error');
            return;
        }

        const data = await response.json(); 

        // 3. Process Success or Explicit Error from JSON
        if (data.status === 'success') {
            setStatus('Verification successful! Redirecting...');
            // Navigate based on the JSON response (e.g., /book)
            navigate(data.redirectTo || '/book', { replace: true });
        } else {
            // Handle explicit error status sent by the backend
            const errorCode = data.code || 'unknown_error';
            setStatus(`Verification failed: ${errorCode}.`);
            navigateToError(errorCode);
        }
      } catch (error) {
        // 4. Handle exceptions like JSON parsing failure or network failure
        console.error("Verification API call failed or JSON invalid:", error);
        setStatus('Verification failed due to a network issue.');
        navigateToError('network_error');
      }
    };

    verifyToken();

  }, [navigateToError]); // Dependency array now uses memoized function

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>⏳ {status}</h2>
      <p>Please wait while we confirm your account...</p>
    </div>
  );
}

export default VerifyEmail;