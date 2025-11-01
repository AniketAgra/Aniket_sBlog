import { Button } from "flowbite-react";
import { useState, useCallback } from 'react';
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
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
    
    // Always use popup for OAuth (redirect causes page reload issues)
    const handleGoogleClick = async () => {
        if (loading) return; // Prevent double-clicks
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            setLoading(true);
            
            // Always use popup (more reliable and no page reload)
            const resultFromGoogle = await signInWithPopup(auth, provider);
            await sendToBackend(resultFromGoogle.user);
            
        } catch (error) {
            console.error('OAuth error:', error);
            
            // Show user-friendly error messages
            if (error?.code === 'auth/popup-blocked') {
                alert('Popup was blocked. Please allow popups for this site and try again.');
            } else if (error?.code === 'auth/popup-closed-by-user') {
                // User closed popup, no error needed
                console.log('User closed the popup');
            } else if (error?.code === 'auth/cancelled-popup-request') {
                // Multiple popup requests, ignore
                console.log('Cancelled duplicate popup request');
            } else {
                // Other errors
                alert('Sign-in error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    
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
