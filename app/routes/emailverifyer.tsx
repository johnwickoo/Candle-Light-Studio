import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // ⚠️ No longer needed

const VERIFICATION_ENDPOINT = import.meta.env.VITE_EMAILVERIFIER_FUNCTION_URL;

function VerifyEmail() {
  const [status, setStatus] = useState('Verifying your email...');
  // const navigate = useNavigate(); // Removed

  useEffect(() => {
    // 1. Get the token from the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (!token) {
      setStatus('Error: Verification link is missing the token.');
      // Use window.location directly since we removed useNavigate
      window.location.assign('/verification-error?msg=missing_token');
      return;
    }

    // --- 2. THE FIX: Directly Navigate to the Appwrite Endpoint ---
    // We let the browser handle the GET request and the subsequent 302 redirect.
    // The current React component will stop rendering, and the browser will navigate away.
    const verificationUrl = `${VERIFICATION_ENDPOINT}?token=${token}`;
    
    // 💡 IMPORTANT: Replace the current page in history
    window.location.replace(verificationUrl); 

  }, []); // Removed navigate from dependency array

  // The user sees this message briefly before the page redirects
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>⏳ {status}</h2>
      <p>Redirecting you to complete verification...</p>
    </div>
  );
}

export default VerifyEmail;