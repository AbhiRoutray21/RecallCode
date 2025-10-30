import './settings.css';
import { BiCog, BiUserCircle,BiBrush   } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { RiResetLeftLine } from "react-icons/ri";
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useOutsideClick from "../../hooks/useOutsideClick";
import useAuth from '../../hooks/useAuth';
import { motion } from 'framer-motion'
import { lazy, Suspense } from "react";
const Profile = lazy(() => import('./Profile/profile'));
const Theme = lazy(() => import('./Theme/theme'));
const Reset = lazy(() => import('./Reset/reset'));

export default function SettingsPop() {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useAuth();
    const settingsBoxRef = useRef();
    const [settingsPop, setSettingsPop] = useState(false);
    useOutsideClick(settingsBoxRef, () => { setSettingsPop(false); navigate(location.pathname); });

    // Open modal when #settings is in the URL
    useEffect(() => {
       setSettingsPop(location.hash.startsWith("#settings"));
    }, [location]);

    // Determine which section to show
    const section = location.hash.replace("#settings", "").replace("/", "") || "profile";


    return (
        <>
            {(settingsPop && auth?.accessToken) && (
                <motion.div
                    className="hidden-settings-field"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        ref={settingsBoxRef}
                        className="settings-box"
                        initial={{ scale: 0.9, y: '-52%', x: '-50%' }}
                        animate={{ scale: 1, y: '-52%', x: '-50%' }}
                    >  
                    <div className='settings-sidebar'>
                        <p className='settings-sidebar-header'>
                            <span><BiCog/>Settings</span>
                            <IoClose className='settings-closeicon2' onClick={()=>{ setSettingsPop(false); navigate(location.pathname);}}/>
                        </p>
                        <div className='settings-options-div'>
                            <p 
                            className={`${section === 'profile' ? "settings-link-active" : ""}`} 
                            onClick={() => navigate("#settings")}
                            >
                                <BiUserCircle className='settings-sidebaricons' /> Profile
                            </p>
                            <p 
                            className={`${section === 'theme' ? "settings-link-active" : ""}`} 
                            onClick={() => navigate("#settings/theme")}
                            >
                                <BiBrush className='settings-sidebaricons' /> Theme
                            </p>
                            <p 
                            className={`${section === 'reset' ? "settings-link-active" : ""}`} 
                            onClick={() => navigate("#settings/reset")}
                            >
                                <RiResetLeftLine className='settings-sidebaricons' /> Reset
                            </p>
                        </div>
                    </div>

                    <div className='settings-contentbox'>
                        {section === 'profile' && <Suspense fallback={<Loader/>}><Profile setSettingsPop={setSettingsPop}/></Suspense>}
                        {section === 'theme' && <Suspense fallback={<Loader/>}><Theme setSettingsPop={setSettingsPop}/></Suspense> }
                        {section === 'reset' && <Suspense fallback={<Loader/>}><Reset setSettingsPop={setSettingsPop}/></Suspense> }
                    </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}

const Loader = () =>{
    return(
        <div className='settings-loader-box'>
        <div className='settings-page-loader'>
            <div className='shimmer'>L</div>
        </div>
        </div>
    )
}
