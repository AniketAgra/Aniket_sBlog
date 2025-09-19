import { Sidebar } from "flowbite-react";
import { HiArrowSmRight, HiUser } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { signOut } from "../redux/user/userSlice.js";


export default function DashSidebar() {
    const location = useLocation()   
    const [tab, setTab] = useState('')   
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try{
            const res = await fetch('/api/auth/signout', { method:'POST', credentials:'include' });
            if(res.ok){
                dispatch(signOut());
                navigate('/signin');
            }
        }catch(e){
            // no-op
        }
    }
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)   
        const tabFromURL = urlParams.get('tab');  
        if(tabFromURL){
            setTab(tabFromURL);
        }                                                     
    },[location.search]) 
  return (
    <Sidebar className="w-full md:w-56">
        <Sidebar.Items>
            <Sidebar.ItemGroup>
                <Link to='/dashboard?tab=profile'>  {/*here we are using the Link component from react-router-dom to navigate to the dashboard page with the tab query parameter set to profile */}
                    <Sidebar.Item active={tab==='profile'} icon={HiUser} label={"User"} labelColor='dark' as='div'>Profile</Sidebar.Item>
                </Link>
                <Sidebar.Item icon={HiArrowSmRight}  className='cursor-pointer' onClick={handleSignOut}>Sign Out</Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>
  )
}
