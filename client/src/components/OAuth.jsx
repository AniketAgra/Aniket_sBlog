import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const auth = getAuth(app);
    const handleGoogleClick = async() => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
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
            console.error(error);
        }
    }
  return (
    <Button className="border bg-none text-gray-900 border-x-orange-500 border-y-pink-500 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-500 rounded-md"
onClick={handleGoogleClick}>
        <AiFillGoogleCircle className="w-6 h-6 mr-2"/>
        Continue with Google
    </Button>
  )
}
