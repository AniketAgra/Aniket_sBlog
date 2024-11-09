import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart,signInSuccess, signInFail } from "../src/redux/user/userSlice";

const Signin = () => {
    const [formData, setFormData] = useState({});
    const {loading, errorMessage} = useSelector(state => state.user);  //state - global value
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
            const res = await fetch('/api/auth/signin',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            
            if(data.success === false){
                dispatch(signInFail(data.message));
            }

            if(res.ok){
                dispatch(signInSuccess(data));
                navigate('/');
            }
        } catch (error) {
            dispatch(signInFail(error.message));
        }
    }
    return (
        <div className="min-h-screen mt-10 md:mt-20 flex items-center justify-center " style={{ width: '100vw', height: '80vh' }}>
            <div className="flex flex-col md:flex-row max-w-4xl w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5 gap-5 items-center justify-center">
                {/* Left */}
                <div className="flex-1 flex flex-col items-start md:items-start">
                    <Link
                        to="/"
                        className="font-bold dark:text-white text-4xl text-center md:text-left"
                    >
                        <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                            Aniket&apos;s
                        </span>
                        Blog
                    </Link>
                    <p className="text-sm mt-5 text-gray-700 dark:text-gray-300  md:text-left">
                        Hello! You may sign in with your email and password or with Google.
                    </p>
                </div>

                {/* Right */}
                <div className="flex-1">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email" value="Your Email" />
                            <TextInput type="email" placeholder="name123@company.com" id="email"  onChange={handleChange}/>
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your Password" />
                            <TextInput type="password" placeholder="Password" id="password" onChange={handleChange}/>
                        </div>
                        <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading}>
                            {
                                loading ? (
                                    <>
                                        <Spinner size='sm'/>
                                        <span className="pl-3">Loading...</span>
                                    </>
                                ) : 'Sign In'
                            }
                        </Button>
                    </form>
                    <div className="flex gap-2 text-sm mt-5 text-gray-700 dark:text-gray-300">
                        <span>Don&apos;t have an account?</span>
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Sign up
                        </Link>
                    </div>
                    {errorMessage && (
                            <Alert className="mt-5" color='failure'>
                                {errorMessage}
                            </Alert>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default Signin;
