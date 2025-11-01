import { Button } from "flowbite-react";
import { useEffect, useState, useCallback } from 'react';
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getAuth, getRedirectResult } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const auth = getAuth(app);
    
    // Helper function to send user data to backend
    const sendToBackend = useCallback(async (user) => {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    name: user.displayName, 
                    email: user.email,
                    googlePhotoUrl: user.photoURL
                }),
            });
            
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            
            if (response.ok && data) {
                dispatch(signInSuccess(data));
                navigate('/');
                return true;
            } else {
                console.error('Google auth failed', data);
                alert('Authentication failed. Please try again.');
                return false;
            }
        } catch (error) {
            console.error('Backend communication error', error);
            alert('Network error. Please check your connection and try again.');
            return false;
        }
    }, [dispatch, navigate]);
    
    // Try popup locally; in production prefer redirect to avoid popup flakiness
    const handleGoogleClick = async () => {
        if (loading) return; // Prevent double-clicks
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            setLoading(true);
            
            // In production, use redirect (more reliable for OAuth)
            if (import.meta.env.PROD) {
                // Store a flag to know we initiated OAuth
                sessionStorage.setItem('oauth_initiated', 'true');
                await signInWithRedirect(auth, provider);
                return; // The page will redirect; code after won't run
            }
            
            // In development, try popup first
            const resultFromGoogle = await signInWithPopup(auth, provider);
            await sendToBackend(resultFromGoogle.user);
            
        } catch (error) {
            console.error('OAuth error:', error);
            
            // If popup blocked/closed, fallback to redirect
            if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
                try {
                    sessionStorage.setItem('oauth_initiated', 'true');
                    await signInWithRedirect(auth, provider);
                } catch (e) {
                    console.error('Redirect sign-in failed', e);
                    alert('Sign-in failed. Please enable popups or try again.');
                }
            } else if (error?.code !== 'auth/cancelled-popup-request') {
                // Don't show error for user cancellation
                alert('Sign-in error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // On mount, handle redirect result if returning from OAuth redirect flow
    useEffect(() => {
        let mounted = true;
        
        const handleRedirectResult = async () => {
            // Check if we initiated OAuth (prevents unnecessary processing)
            const initiated = sessionStorage.getItem('oauth_initiated');
            if (!initiated) return;
            
            try {
                setLoading(true);
                const result = await getRedirectResult(auth);
                
                if (result && result.user && mounted) {
                    // Clear the flag
                    sessionStorage.removeItem('oauth_initiated');
                    
                    // Send to backend
                    const success = await sendToBackend(result.user);
                    
                    if (!success && mounted) {
                        setLoading(false);
                    }
                } else {
                    // No result, clear flag and stop loading
                    sessionStorage.removeItem('oauth_initiated');
                    if (mounted) setLoading(false);
                }
            } catch (err) {
                console.error('Handle redirect result error', err);
                sessionStorage.removeItem('oauth_initiated');
                
                // Only show error if it's not a "no auth event" error
                if (err?.code && !String(err.code).includes('no-auth-event') && mounted) {
                    alert('Authentication error. Please try signing in again.');
                }
                
                if (mounted) setLoading(false);
            }
        };
        
        handleRedirectResult();
        
        return () => {
            mounted = false;
        };
    }, [auth, sendToBackend]);
    return (
        <Button 
            type="button" 
            disabled={loading}
            className="border bg-none bg-transparent !border-x-orange-500 !border-y-pink-500 text-pink-200 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-500 rounded-md disabled:opacity-50"
            onClick={handleGoogleClick}
        >
            <AiFillGoogleCircle className="w-6 h-6 mr-2"/>
            {loading ? 'Signing in...' : 'Continue with Google'}
        </Button>
    );
}
