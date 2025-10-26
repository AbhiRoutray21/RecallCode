import './loginPop.css';
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useOutsideClick from "../../hooks/useOutsideClick";
import useAuth from '../../hooks/useAuth';
import { motion } from 'framer-motion'

export default function LoginPopMessage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useAuth();
    const optionBoxRef = useRef();
    const [loginPop, setloginPop] = useState(false);
    useOutsideClick(optionBoxRef, () => { setloginPop(false); navigate(location.pathname); });

    // Open modal when #login is in the URL
    useEffect(() => {
        setloginPop(location.hash === "#login");
    }, [location.hash]);

    return (
        <>
            {(loginPop && !auth?.accessToken) && (
                <motion.div
                    className="hidden-loginPop-field"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        ref={optionBoxRef}
                        className="loginPop-box"
                        initial={{ scale: 0.9, y: '-60%', x: '-50%' }}
                        animate={{ scale: 1, y: '-60%', x: '-50%' }}
                        // transition={{ duration: 0.25, ease: "easeOut" }}
                    >  
                
                        <span >✨ Unlock More Features</span>
                        <p >
                            Login to access more features & a wider range of questions.
                        </p>
                        
                        <div className="loginPop-buttons">
                            <button className="loginPop-login" onClick={() => navigate("/login")}>
                                Log in
                            </button>
                            <button className="loginPop-cancle" onClick={() => navigate(location.pathname)}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}


