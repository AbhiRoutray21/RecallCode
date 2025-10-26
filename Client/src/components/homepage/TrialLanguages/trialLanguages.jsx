import "./trialLanguages.css"; // we'll define CSS here
import { motion } from "framer-motion";
import {useNavigate} from 'react-router-dom';
import languages from "../../../utility/languagesArrary";

const fadeUp = {
  hidden: { 
    opacity: 0,
    y: 70 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition:{
        duration:0.8,
    } 
  },
  hover:{
    y:-8,
  }
};


const LanguageGrid = () =>{

    const navigate = useNavigate();

    return (
        <div className="trial-language-container">
            <h2 id="choose-language">Choose a Language to Start Recall<p>(20 Trial Questions)</p></h2>
            <div className="language-grid">
                {languages.map((lang, index) => {
                    const MotionIcon = motion.create(lang.Icon);
                    
                   return (
                    <motion.div 
                    variants={fadeUp} 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true, margin:'-30px' }} 
                    key={index} 
                    whileHover={{ y: -8, boxShadow: lang.styles.boxShadow, transition:{duration:0.1}}}
                    className="language-box"
                    onClick={()=>navigate(`trial/${lang.name}`)}>
                        <MotionIcon className="lang-icons" 
                        initial={{ filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }}
                        whileHover={{
                        filter: `drop-shadow(${lang.styles.dropShadow})`
                        }} 
                        />
                        <h3>{lang.name}</h3>
                    </motion.div>
                   )
                })}
            </div>
        </div>
                                   
    );
};

export default LanguageGrid;