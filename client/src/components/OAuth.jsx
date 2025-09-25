import { Button } from "flowbite-react";
import { useEffect } from 'react';
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getAuth, getRedirectResult } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const auth = getAuth(app);
    // Try popup locally; in production prefer redirect to avoid popup flakiness
    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            if (import.meta.env.PROD) {
                await signInWithRedirect(auth, provider);
                return; // the page will navigate; further code won't run now
            }
            const resultFromGoogle = await signInWithPopup(auth, provider);
            const response = await fetch('/api/auth/google',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ 
                    name: resultFromGoogle.user.displayName, 
                    email: resultFromGoogle.user.email,
                    googlePhotoUrl: resultFromGoogle.user.photoURL
                }),
            });
            // Safely parse JSON (server might return empty body on error)
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            if(response.ok){
                dispatch(signInSuccess(data));
                navigate('/');
            } else {
                console.error('Google auth failed', data);
            }
    } catch (error) {
            // If popup blocked/closed, use redirect as a robust fallback
            if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
                try {
                    await signInWithRedirect(auth, provider);
                } catch (e) {
                    console.error('Redirect sign-in failed', e);
                }
            } else {
                console.error(error);
            }
        }
    }
    
    // On mount, handle redirect result if returning from redirect flow
    useEffect(() => {
        (async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result && result.user) {
                    const response = await fetch('/api/auth/google',{
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify({ 
                            name: result.user.displayName, 
                            email: result.user.email,
                            googlePhotoUrl: result.user.photoURL
                        }),
                    });
                    const text = await response.text();
                    const data = text ? JSON.parse(text) : null;
                    if (response.ok) {
                        dispatch(signInSuccess(data));
                        navigate('/');
                    } else {
                        console.error('Google auth (redirect) failed', data);
                    }
                }
            } catch (err) {
                // ignore when there's no redirect result
                if (err?.code && !String(err.code).includes('no-auth-event')) {
                    console.error('Handle redirect result error', err);
                }
            }
        })();
    }, [auth, dispatch, navigate]);
    return (
        <Button type="button" className="border bg-none bg-transparent !border-x-orange-500 !border-y-pink-500 text-pink-200 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-500 rounded-md"
onClick={handleGoogleClick}>
        <AiFillGoogleCircle className="w-6 h-6 mr-2"/>
        Continue with Google
    </Button>
  )
}
