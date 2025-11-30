import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router is used


const VERIFICATION_ENDPOINT = 'https://692c66e00024652f6922.fra.appwrite.run/';

function VerifyEmail() {
  const [status, setStatus] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get the token from the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (!token) {
      setStatus('Error: Verification link is missing the token.');
      // Redirect to a specific error page if no token is found
      navigate('/verification-error?msg=missing_token', { replace: true });
      return;
    }

    // 2. Make the API call to your backend function
    // NOTE: The backend function expects a GET request with the token in the query string
    const verifyToken = async () => {
      try {
        // Construct the full URL for the Appwrite function
        const url = `${VERIFICATION_ENDPOINT}?token=${token}`;
        
        // Appwrite Function is configured to handle the verification and RETURN A REDIRECT (302)
        // We call the URL and let the browser follow the redirect.
        
        // We use fetch to initiate the request, the browser follows the redirect.
        // We don't actually process the fetch response here because the backend handles the redirect.
        await fetch(url); 
        
        // In a successful scenario, the backend handles the 302 redirect.
        // If the fetch succeeds without a redirect (e.g., if the backend failed to redirect), 
        // we should fall back to navigating manually.
        
      } catch (error) {
        console.error("Verification API call failed:", error);
        setStatus('Verification failed due to a network error.');
        // Navigate to a generic error page as a fallback
        navigate('/verification-error?msg=network_error', { replace: true });
      }
    };

    verifyToken();

  }, [navigate]);

  // The user sees this message while the browser is waiting for the backend redirect
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>⏳ {status}</h2>
      <p>Please wait while we confirm your account...</p>
    </div>
  );
}

export default VerifyEmail;