import {
    BiArrowFromRight, BiArrowFromLeft,
    BiEditAlt,BiSelectMultiple,
    BiBrain,BiLogOut,BiCog,
} from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { MdErrorOutline,MdOutlineLightMode,MdOutlineDarkMode } from "react-icons/md";
import './sidebar.css';
import { useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import useOutsideClick from "../../hooks/useOutsideClick";
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from "../../hooks/useAuth";
import useMainLayoutContext from "../../hooks/useMainLayoutContext";
import LogoIcon from "../customIcons/logoIcon";

export default function Sidebar() {
    const {auth} = useAuth();
    const [sideBarOpen, setsideBarOpen] = useState(()=>{
       const state = localStorage.getItem('sidebar')===null?'true':localStorage.getItem('sidebar');
       return state === 'true';
    }); //this state control sidebar for pc browser
    const {isSidebarOpen,setIsSidebarOpen} = useMainLayoutContext(); //this state control sidebar for phone browser
    const navigate = useNavigate();
    const location = useLocation();

    const optionBoxRef = useRef();
    const [boxOpen, setboxOpen] = useState(false);
    const [logoutPop, setlogoutPop] = useState(false);
    const [theme,setTheme] = useState(localStorage.getItem('theme') || 'Dark');
    useOutsideClick(optionBoxRef, () => {setboxOpen(false);setlogoutPop(false);});

    const sideBarPcOpen = () =>{ 
        setsideBarOpen(true);
        localStorage.setItem('sidebar',true);
    };
    const sideBarPcClose = () => {
        setsideBarOpen(false);
        localStorage.setItem('sidebar', false);
    };


    const closeSidebar = () => setIsSidebarOpen(false);

    const showAnimation = {
        hidden: {
            width: 0,
            opacity: 0,
            transition: {
                duration: 0.3,
            }
        },
        show: {
            width: "auto",
            opacity: 1,
            transition: {
                duration: 0.3,
            }
        },
        hiddenIcon: {
            opacity: 0,
            transition: {
                duration: 0.3,
            }
        },
        showIcon: {
            opacity: 1,
            transition: {
                duration: 0.3,
            }
        }
    }

    const dark = () => {
        setTheme('Dark');
        document.documentElement.setAttribute("data-theme", "Dark");
        localStorage.setItem("theme", 'Dark');
    };
    const light = () => {
        setTheme('Light');
        document.documentElement.setAttribute("data-theme", "Light");
        localStorage.setItem("theme",'Light');
    };

    return (
        <>  
            <div className={`sidebar-hidden-field ${isSidebarOpen ? "active" : ""}`} onClick={closeSidebar}/>

            <motion.div
            initial={{ width: sideBarOpen ? "255px" : "55px"}}
            animate={{ width: sideBarOpen ? "255px" : "55px",transition:{duration:0.2} }} 
            className={`sidebar-container ${isSidebarOpen ? "active" : ""}`} 
            style={sideBarOpen ? {} : { backgroundColor: "var(--bg-p-color)", borderRight: '1px solid var(--border-color)' }}
            >
                <div className='sidebar-content'>
                    <div className='header-options-container'>
                        <div className='sidebar-header' style={sideBarOpen ? {} : { backgroundColor: 'var(--bg-p-color)' }}>
                            {sideBarOpen && 
                                <div className="sidebar-logo" onClick={() => closeSidebar()} style={{ cursor: 'pointer' }}>
                                    <NavLink className={'sidebar-navlink'} to={'/'}><LogoIcon size={40}  className="logoIcon"/><span>RecallCode</span></NavLink>
                                </div>
                            }
                            <motion.div className="sidebar-closeicon-div">
                                {sideBarOpen
                                    ? <>
                                        <IoClose className={`sidebar-crossicon ${isSidebarOpen ? "active" : ""}`} onClick={closeSidebar}/>
                                        <BiArrowFromRight className={`sidebar-closeicon ${isSidebarOpen ? "active" : ""}`} onClick={sideBarPcClose} />
                                        <span className={`sidebar-closeicon-message`}>Close sidebar</span>
                                    </>
                                    : <>
                                        <BiArrowFromLeft className="sidebar-openicon" onClick={sideBarPcOpen} />
                                        <span className={`sidebar-openicon-message`}>Open sidebar</span>
                                    </>
                                }
                            </motion.div>
                        </div>
                        <div className='sidebar-options' style={sideBarOpen ? {} : { backgroundColor: 'var(--bg-p-color)' }}>
                            <div className={ `option-div ${location.pathname === '/practice' && "link-active"}`} onClick={()=> {auth?.accessToken ? navigate("/practice") : navigate("#login");closeSidebar()}}>
                                <BiEditAlt className="option-icon" />
                                <AnimatePresence>
                                    {sideBarOpen && (
                                        <motion.span variants={showAnimation} initial='hidden' animate='show' exit='hidden'>
                                            Practice
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className={`option-div ${location.pathname === '/selective' && "link-active"}`} onClick={()=> {auth?.accessToken ? navigate("/selective") : navigate("#login");closeSidebar()}} >
                                <BiSelectMultiple className="option-icon"/>
                                <AnimatePresence>
                                    {sideBarOpen && (
                                        <motion.span variants={showAnimation} initial='hidden' animate='show' exit='hidden'>
                                            Selective Questions
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className={`option-div ${location.pathname === '/challenge' && "link-active"}`}  onClick={()=> {auth?.accessToken ? navigate("/challenge") : navigate("#login");closeSidebar()}}>
                                <BiBrain className="option-icon" />
                                <AnimatePresence>
                                    {sideBarOpen && (
                                        <motion.span variants={showAnimation} initial='hidden' animate='show' exit='hidden'>
                                            Challenge
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='sidebar-profile' style={sideBarOpen ? {} : { backgroundColor: 'var(--bg-p-color)' }}>
                    <div className={`profile ${boxOpen && 'profile-active'}`} onClick={() => auth?.accessToken && setboxOpen(true)}>
                        <div className="profile-avatar">
                            { auth?.accessToken ? auth.name[0] :'U'}
                        </div>
                        <AnimatePresence>
                            {sideBarOpen && 
                                <motion.span variants={showAnimation} initial='hidden' animate='show' exit='hidden'>
                                    {auth?.accessToken ? auth.name : 'User' }
                                </motion.span>
                            }
                        </AnimatePresence>

                        {!auth?.accessToken &&
                            <div className="theme-icons">
                                <AnimatePresence>
                                    {sideBarOpen && 
                                        <motion.span variants={showAnimation} initial='hiddenIcon' animate='showIcon' exit='hiddenIcon'>
                                            {theme === 'Dark'
                                            ?<MdOutlineLightMode className="theme-icon" onClick={light}/>
                                            :<MdOutlineDarkMode className="theme-icon" onClick={dark}/>}
                                        </motion.span>
                                    }
                                </AnimatePresence>
                            </div>
                        }
                    </div>     
                </div>
            </motion.div>

            {boxOpen &&
                <div className="hidden-field">
                    <div ref={optionBoxRef} className="profile-items-box">
                        <div className="profile-items-box-inside">
                            <div className="p-inside-upper">
                                <div className="p-i-u-option-div" onClick={() => {navigate('#settings');setboxOpen(false);closeSidebar()}}>
                                    <BiCog className="p-i-u-option-icon" />
                                    <span>Settings</span>
                                </div>
                                <div className="p-i-u-option-div" onClick={() => {window.open("http://localhost:5174", "_blank", "noopener");closeSidebar();setboxOpen(false)}}>
                                    <MdErrorOutline className="p-i-u-option-icon about" />
                                    <span>About</span>
                                </div>
                            </div>
                            <div className="p-inside-partition" />
                            <div className="p-inside-lower">
                                <div className="p-i-u-option-div" onClick={()=>{setboxOpen(false);setlogoutPop(true);closeSidebar()}}>
                                    <BiLogOut className="p-i-u-option-icon" />
                                    <span>Logout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {logoutPop &&
                <motion.div className="hidden-logoutPop-field" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div ref={optionBoxRef} className="logoutPop-box" initial={{ scale: 0.9, y: '-60%', x: '-50%' }} animate={{ scale: 1, y: '-60%', x: '-50%' }}>
                        <span>Log out?</span>
                        <p>
                            If you log out, you won’t be able to
                            access more features or track your
                            learning progress until you log back in.
                        </p>
                        <div className="logoutPop-buttons">
                            <button className="logoutPop-cancle" onClick={()=>setlogoutPop(false)}>Cancle</button>
                            <button className="logoutPop-logout" onClick={()=>{navigate('/logout');setlogoutPop(false);}}>Log out</button>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </>
    );
}