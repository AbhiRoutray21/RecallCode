import './homepage.css';
import { motion } from 'framer-motion';
import ProgressRingAmination from './ProgressRing/ProgressRing';
import LanguageGrid from './TrialLanguages/trialLanguages';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LogoIcon from '../customIcons/logoIcon';

const Homepage = () => {
   const {auth} = useAuth();

   const parentVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: {
         opacity: 1,
         y: 0,
         transition: {
            staggerChildren: 0.3, // delay between each child
            duration: 0.5,        // duration of each item
            ease: "easeOut",
         },
      },
   };

   const childVariants = {
      hidden: {
         opacity: 0,
         y: 30
      },
      visible: {
         opacity: 1,
         y: 0,
         transition: {
            duration: 0.6,
         }
      }
   };

   function setAppHeight() {
      const appHeight = window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${appHeight}px`);
   }

   window.addEventListener("resize", setAppHeight);
   setAppHeight();

   return (
         <div className='homepage-container'>
            <div className="trial-container">
                  <motion.div variants={parentVariants} initial="hidden" animate="visible" className="hero"  >
                     <motion.h1 variants={childVariants} className="hero-title fade-item fade-delay-1">
                        Never Forget What You’ve Learned — RecallCode
                     </motion.h1>
                     <motion.p variants={childVariants} className="hero-tagline fade-item fade-delay-2">
                        Your Daily Dose of Coding Confidence
                     </motion.p>
                     <motion.p variants={childVariants} className="hero-subtext fade-item fade-delay-3">
                        Stop losing your hard-earned knowledge. Practice daily to refresh syntax, strengthen
                        fundamentals, and keep your coding sharp.
                     </motion.p>
                     <motion.p variants={childVariants} className="hero-subtext fade-item fade-delay-4">
                        Whether you’re learning your first language or juggling many, RecallCode helps you remember,
                        recall, and master with ease.
                     </motion.p>

                     <motion.div variants={childVariants} className="hero-buttons fade-item fade-delay-5">
                        <Link to={`${auth?.accessToken?'practice':'#login'}`}> <button className="cta-btn primary">Start Daily Practice</button></Link>
                        <a href='#choose-language'><button className="cta-btn secondary">Pick a Language</button></a>
                        <Link to={`${auth?.accessToken?'challenge':'#login'}`}><button className="cta-btn tertiary">Take a Challenge</button></Link>
                     </motion.div>

                     <motion.div className="features">
                        <motion.h2 variants={childVariants} >Why RecallCode?</motion.h2>
                        <div className="feature-grid">
                           <motion.div initial={childVariants.hidden} whileInView={childVariants.visible} viewport={{ once: true, margin:'-100px' }} className="feature-card">
                              <span className="icon">⚡</span>
                              <h3>Daily Practice</h3>
                              <p>Refresh your coding knowledge in just a few minutes each day.</p>
                           </motion.div>
                           <motion.div initial={childVariants.hidden} whileInView={childVariants.visible} viewport={{ once: true, margin:'-100px' }} className="feature-card">
                              <span className="icon">🧩</span>
                              <h3>Selective Questions</h3>
                              <p>Focus on the tricky concepts you often forget and master them.</p>
                           </motion.div>
                           <motion.div initial={childVariants.hidden} whileInView={childVariants.visible} viewport={{ once: true, margin:'-100px' }} className="feature-card">
                              <span className="icon">🎯</span>
                              <h3>Challenges</h3>
                              <p>Sharpen your problem-solving with timed challenges & coding tasks.</p>
                           </motion.div>
                           <motion.div initial={childVariants.hidden} whileInView={childVariants.visible} viewport={{ once: true, margin:'-100px' }} className="feature-card">
                              <span className="icon">📈</span>
                              <h3>Track Progress</h3>
                              <p>Stay motivated by watching your streaks and skills grow.</p>
                           </motion.div>
                        </div>
                     </motion.div>
                  </motion.div>

                  <ProgressRingAmination />

                  <LanguageGrid />

                  <p className='homepage-endMessage' style={{color:'var(--text-color)'}}>Keep learning, Keep Growing!</p>

                  <div className='homepage-footer'>
                    <div className='footer-items'>
                        <div className='footer-item'>
                           <span className='footer-logo'><LogoIcon className='footer-logoIcon'/>RecallCode</span>
                           <p className='footer-message'>
                              RecallCode helps you practice coding the smart way.
                              Refresh your syntax, recall key concepts, and grow
                              your problem-solving confidence — one quiz at a time.
                           </p>
                        </div>
                        <div className='footer-item footer-links'>
                           <NavLink className={"footer-navlink"} to={auth?.accessToken ? "/practice" : "#login"}>Practice</NavLink>
                           <NavLink className={"footer-navlink"} to={auth?.accessToken ? "/selective" : "#login"}>Selective Questions</NavLink>
                           <NavLink className={"footer-navlink"} to={auth?.accessToken ? "/challenge" : "#login"}>Challenge</NavLink>
                        </div>
                        <div className='footer-item footer-links'>
                           <NavLink 
                           className={"footer-navlink"} 
                           to={'http://localhost:5174'} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           >
                              About
                           </NavLink>
                           <NavLink 
                           className={"footer-navlink"} 
                           to={'http://localhost:5174/privacy-policy'} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           >
                              Privacy Policy
                           </NavLink>
                           <NavLink 
                           className={"footer-navlink"} 
                           to={'http://localhost:5174/terms'} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           >
                              Terms and Conditions
                           </NavLink>
                        </div>
                    </div>
                    <div className='copyright'>
                        © 2025 RecallCode. All rights reserved.
                    </div>
                  </div>
            </div>
         </div> 
   );
};

export default Homepage;
