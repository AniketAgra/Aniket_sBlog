import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import OAuth from "../src/components/OAuth";

const Signup = () => {
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim()});
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        if(!formData.username || !formData.email || !formData.password){
            return setErrorMessage('Please fill out all fields.')
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch('/api/auth/register',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            setLoading(false);

            if(!res.ok || data?.success === false){
                const raw = data?.error?.message || data?.message || '';
                let msg = raw || 'Registration failed';
                // Handle common duplicate key errors from MongoDB
                if (res.status === 409 || /duplicate key/i.test(raw) || data?.error?.code === 11000) {
                    if (/email/i.test(raw)) {
                        msg = 'Email already in use';
                    } else if (/username/i.test(raw)) {
                        msg = 'Username already in use';
                    } else {
                        msg = 'Account already exists with provided details';
                    }
                }
                if (res.status === 400 && /mandatory|required/i.test(raw)) {
                    msg = 'Please fill out all fields.';
                }
                return setErrorMessage(msg);
            }
            
            if(res.ok){
                navigate('/signin');
            }
        } catch (error) {
            setErrorMessage(error.message || 'Network error while signing up');
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
                        Hello! You may sign up with your email and password or with Google.
                    </p>
                </div>

                {/* Right */}
                <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="username" value="Your Username" />
                            <TextInput type="text" placeholder="Username" id="username" onChange={handleChange} />
                        </div>
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
                            ) : 'Sign Up'}
                        </Button>
                        <OAuth />
                    </form>
                    <div className="flex gap-2 text-sm mt-5 text-gray-700 dark:text-gray-300">
                        <span>Already have an account?</span>
                        <Link to="/signin" className="text-blue-500 hover:underline">
                            Sign in
                        </Link>
                    </div>
                    {errorMessage && (
                        <Alert className="mt-5" color='failure'>
                            {errorMessage}
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
