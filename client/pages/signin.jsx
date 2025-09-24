import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart,signInSuccess, signInFail } from "../src/redux/user/userSlice";
import OAuth from "../src/components/OAuth";

const Signin = () => {
    const [formData, setFormData] = useState({});
    // Use the correct slice fields: loading, error
    const { loading, error } = useSelector(state => state.user);  //state - global value
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim()});
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        if(!formData.email || !formData.password){
            return dispatch(signInFail('All fields are mandatory.'));
        }
        try {
            dispatch(signInStart());
            const res = await fetch('/api/auth/login',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            
            if(!res.ok || data?.success === false){
                // Normalize common auth errors to a user-friendly message
                const raw = data?.error?.message || data?.message || '';
                let msg = raw || 'Login failed';
                if (res.status === 400 || res.status === 401 || res.status === 404) {
                    msg = 'Wrong email or password';
                }
                // Fallback if backend used a generic invalid credentials message
                if (/invalid\s+username\s+or\s+password/i.test(raw)) {
                    msg = 'Wrong email or password';
                }
                return dispatch(signInFail(msg));
            }

            if(res.ok){
                dispatch(signInSuccess(data));
                navigate('/');
            }
        } catch (error) {
            dispatch(signInFail(error.message || 'Network error while signing in'));
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* Left */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                    <Link
                        to="/"
                        className="font-bold dark:text-white text-4xl text-center md:text-left"
                    >
                        <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                            Aniket&apos;s
                        </span>
                        {' '}Blog
                    </Link>
                    <p className="text-sm mt-5 text-gray-700 dark:text-gray-300 text-center md:text-left">
                        Hello! You may sign in with your email and password or with Google.
                    </p>
                </div>

                {/* Right */}
                <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email" value="Your Email" />
                            <TextInput type="email" placeholder="name123@company.com" id="email" onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your Password" />
                            <TextInput type="password" placeholder="Password" id="password" onChange={handleChange} />
                        </div>
                        <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner size='sm' />
                                    <span className="pl-3">Loading...</span>
                                </>
                            ) : 'Sign In'}
                        </Button>
                        <OAuth />
                    </form>
                    <div className="flex gap-2 text-sm mt-5 text-gray-700 dark:text-gray-300">
                        <span>Don&apos;t have an account?</span>
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Sign up
                        </Link>
                    </div>
                    {error && (
                        <Alert className="mt-5" color='failure'>
                            {error}
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signin;
