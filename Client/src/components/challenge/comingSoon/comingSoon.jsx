import './comingSoon.css';
import { useRef,} from "react";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom';

function ComingSoonPopup({setComingSoonPopup}) {
    const navigate = useNavigate();
    const location = useLocation();
    const optionBoxRef = useRef();
    useOutsideClick(optionBoxRef, () => {setComingSoonPopup(false);navigate(location.pathname);});
    
    return (
        <motion.div
            className="hidden-comingSoonPopup-field"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                ref={optionBoxRef}
                className="comingSoonPopup-box"
                initial={{ scale: 0.9, y: '-60%', x: '-50%' }}
                animate={{ scale: 1, y: '-60%', x: '-50%' }}
            >

                <span className='comingSoonPopup-heading' >
                    <span>🚧 Coming Soon</span>
                </span>
                <p >
                    {`This section is not available yet.
                    We’re still building challenges for you.
                    Please check back later.`}
                </p>

            </motion.div>
        </motion.div>   
    )
}

export default ComingSoonPopup;
