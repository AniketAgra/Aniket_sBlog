import { Button, Label, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";

const signup = () => {
    return (
        <div className="min-h-screen mt-10 md:mt-20 flex items-center justify-center ">
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
                        Hello! You may sign up with your email and password or with Google.
                    </p>
                </div>

                {/* Right */}
                <div className="flex-1">
                    <form className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="username" value="Your Username" />
                            <TextInput type="text" placeholder="Username" id="username" required />
                        </div>
                        <div>
                            <Label htmlFor="email" value="Your Email" />
                            <TextInput type="email" placeholder="name123@company.com" id="email" required />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your Password" />
                            <TextInput type="password" placeholder="Password" id="password" required />
                        </div>
                        <Button gradientDuoTone="purpleToPink" type="submit">
                            Sign up
                        </Button>
                    </form>
                    <div className="flex gap-2 text-sm mt-5 text-gray-700 dark:text-gray-300">
                        <span>Already have an account?</span>
                        <Link to="/signin" className="text-blue-500 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default signup;
