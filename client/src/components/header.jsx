import 'flowbite/dist/flowbite.css';
import { Navbar, TextInput, Button } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon } from 'react-icons/fa';

export default function Header() {
    const path = useLocation().pathname;

    return (
        <Navbar className="border-b-2">
            <Link
                to='/'
                className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold '
            >
                <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
                    Aniket&apos;s
                </span>
                Blog
            </Link>
            
            <form className='flex items-center'>
                <TextInput
                    type='text'
                    placeholder='Search...'
                    rightIcon={AiOutlineSearch}
                    className='hidden lg:inline'
                />
            </form>
            <Button className='w-12 h-10 lg:hidden' color='gray' pill>
                <AiOutlineSearch />
            </Button>
            
            <div className='flex gap-2 md:order-2'>
                <Button className='w-12 h-10 hidden sm:inline' color='gray' pill>
                    <FaMoon />
                </Button>
                <Link to='/signin'>
                <Button
                    className="border bg-none text-blue-500 border-x-purple-500 border-y-blue-500 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-purple-500 hover:to-blue-500 rounded-md"
                    pill
                >
                    Sign In
                </Button>
                </Link>
                <Navbar.Toggle />
            </div>
            
            {/* Show Navbar.Collapse only on smaller screens */}
            <Navbar.Collapse>
                <Navbar.Link as={'div'}>
                    <Link 
                        to='/'
                        className={`block px-3 py-2 rounded-md ${path === '/' ? 'bg-blue-500 text-white' : 'text-gray-700'} lg:bg-transparent lg:text-gray-900 lg:hover:text-blue-500`}
                    >
                        Home
                    </Link>
                </Navbar.Link>
                <Navbar.Link as={'div'}>
                    <Link 
                        to='/about'
                        className={`block px-3 py-2 rounded-md ${path === '/about' ? 'bg-blue-500 text-white' : 'text-gray-700'} lg:bg-transparent lg:text-gray-900 lg:hover:text-blue-500`}
                    >
                        About
                    </Link>
                </Navbar.Link>
                <Navbar.Link as={'div'}>
                    <Link 
                        to='/projects'
                        className={`block px-3 py-2 rounded-md ${path === '/projects' ? 'bg-blue-500 text-white' : 'text-gray-700'} lg:bg-transparent lg:text-gray-900 lg:hover:text-blue-500`}
                    >
                        Projects
                    </Link>
                </Navbar.Link>
            </Navbar.Collapse>

            {/* Directly show links on large screens without bullets */}
            <div className='hidden lg:flex gap-4'>
                <Link 
                    to='/' 
                    className={`text-gray-900 ${path === '/' ? 'text-blue-500 font-semibold' : 'hover:text-blue-500'}`}
                >
                    Home
                </Link>
                <Link 
                    to='/about' 
                    className={`text-gray-900 ${path === '/about' ? 'text-blue-500 font-semibold' : 'hover:text-blue-500'}`}
                >
                    About
                </Link>
                <Link 
                    to='/projects' 
                    className={`text-gray-900 ${path === '/projects' ? 'text-blue-500 font-semibold' : 'hover:text-blue-500'}`}
                >
                    Projects
                </Link>
            </div>
        </Navbar>
    );
}
