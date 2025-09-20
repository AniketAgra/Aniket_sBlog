import { useEffect,useState } from "react"
import { useLocation } from "react-router-dom"   //useLocation - a hook that returns the location object that represents the current URL
import DashSidebar from "../src/components/DashSidebar"
import DashProfile from "../src/components/DashProfile"
import AdminCreatePost from "../src/components/AdminCreatePost"
import AdminCreateProject from "../src/components/AdminCreateProject"
import AdminLayout from "../src/components/admin/AdminLayout";
import SectionHeader from "../src/components/admin/SectionHeader";
import AnalyticsRow from "../src/components/admin/AnalyticsRow";
import ResumeDownloadsPanel from "../src/components/admin/ResumeDownloadsPanel";

function Dashboard() {
    const location = useLocation()   //useLocation() - returns the location object that represents the current URL
    const [tab, setTab] = useState('')   //useState() - returns a stateful value, and a function to update it
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)   //URLSearchParams - an interface that provides utility methods to work with the query string of a URL and allows to easily parse and manipulate URL query strings
        const tabFromURL = urlParams.get('tab');  
        if(tabFromURL){
            setTab(tabFromURL);
        }                                                     //location.search - a string that represents the query string of the URL
    },[location.search]) //useEffect() - a hook that runs side effects, it takes a function and an array of dependencies as arguments
                         //[location.search] - an array of dependencies, useEffect() will run only when the value of location.search changes
    return (
        <AdminLayout sidebar={<DashSidebar/>}>
            {tab==='' && (
                <>
                    <SectionHeader title="Blog Dashboard" subtitle="Quick snapshot of your content performance" />
                    <AnalyticsRow />
                    <ResumeDownloadsPanel />
                </>
            )}
            {tab==='profile' && <DashProfile/>}
            {tab==='create-post' && <AdminCreatePost/>}
            {tab==='create-project' && <AdminCreateProject/>}
        </AdminLayout>
    )
}

export default Dashboard
