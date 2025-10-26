import './expire.css';
import { useNavigate } from "react-router-dom";
import useAuth from '../../hooks/useAuth';
import { motion } from 'framer-motion'
import { TbAlertTriangle } from "react-icons/tb";

export default function SessionExpire() {
    const navigate = useNavigate();
    const {expire,setExpire} = useAuth();

    const logout = () =>{
        setExpire(false);
        navigate("/login");
    };

    return (
        <>
            {expire && (
                <motion.div
                    className="hidden-expire-field"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="expire-box"
                        initial={{ scale: 0.9, y: '-60%', x: '-50%' }}
                        animate={{ scale: 1, y: '-60%', x: '-50%' }}
                        // transition={{ duration: 0.25, ease: "easeOut" }}
                    >  
                        <div className='alert-message'> 
                            <TbAlertTriangle className='expire-alert-icon' /> 
                            <span>Oops, Your session has expired</span>
                        </div>
                        <p >
                           Log in again and let's keep practicing!
                        </p>
                        
                        <div className="expire-buttons">
                            <button className="expire-login" onClick={logout}>
                                Log in
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}


