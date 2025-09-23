import { Sidebar } from "flowbite-react";
import { HiArrowSmRight, HiUser } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from "../redux/user/userSlice.js";
import styles from '../styles/components/DashSidebar.module.css';


export default function DashSidebar() {
    const location = useLocation()   
    const [tab, setTab] = useState('')   
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((s) => s.user);
    const isAdmin = currentUser?.role === 'admin';

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
    <Sidebar className={[styles.sidebarRoot, styles.transparentSidebar].join(' ')}>
        <Sidebar.Items>
            <Sidebar.ItemGroup className="[&>*]:rounded-xl [&>*]:transition-all [&>*]:duration-200">
                <Link to='/dashboard?tab=profile'>  {/*here we are using the Link component from react-router-dom to navigate to the dashboard page with the tab query parameter set to profile */}
                    <Sidebar.Item active={tab==='profile'} icon={HiUser} label={"User"} labelColor='dark' as='div' className={styles.hoverItem}>Profile</Sidebar.Item>
                </Link>
                                {isAdmin && (
                                    <>
                                        <Link to='/dashboard?tab=create-post'>
                                                <Sidebar.Item active={tab==='create-post'} as='div' className={styles.hoverItem}>Create Post</Sidebar.Item>
                                        </Link>
                    <Link to='/dashboard?tab=create-project'>
                                                <Sidebar.Item active={tab==='create-project'} as='div' className={styles.hoverItem}>Create Project</Sidebar.Item>
                                        </Link>
                    <Link to='/dashboard?tab=manage-posts'>
                        <Sidebar.Item active={tab==='manage-posts'} as='div' className={styles.hoverItem}>Manage Posts</Sidebar.Item>
                    </Link>
                    <Link to='/dashboard?tab=manage-projects'>
                        <Sidebar.Item active={tab==='manage-projects'} as='div' className={styles.hoverItem}>Manage Projects</Sidebar.Item>
                    </Link>
                    <Link to='/dashboard?tab=subscribers'>
                        <Sidebar.Item active={tab==='subscribers'} as='div' className={styles.hoverItem}>Subscribers</Sidebar.Item>
                    </Link>
                    <Link to='/dashboard?tab=resume-downloads'>
                        <Sidebar.Item active={tab==='resume-downloads'} as='div' className={styles.hoverItem}>Resume Downloads</Sidebar.Item>
                    </Link>
                                    </>
                                )}
                <Sidebar.Item icon={HiArrowSmRight}  className={[styles.hoverItem,'cursor-pointer'].join(' ')} onClick={handleSignOut}>Sign Out</Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>
  )
}
