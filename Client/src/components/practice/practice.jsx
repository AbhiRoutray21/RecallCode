import './practice.css';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import languages from "../../utility/languagesArrary";
import { useEffect, useState } from 'react';
import ProgressBar from '../../utility/ProgressBar/progressbar';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axios from "axios";
import { toast } from 'react-toastify';
import useMainLayoutContext from '../../hooks/useMainLayoutContext';
import useOutsideClick from "../../hooks/useOutsideClick";
import { useRef } from 'react';

const fadeUp = {
   hidden: {
      opacity: 0,
      y: 50
   },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
      }
   },
   hover: {
      y: -8,
   }
};

const Practice = () => {
   const axiosPrivate = useAxiosPrivate();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   const {subInfo,setSubInfo,progressData,setProgressData} = useMainLayoutContext();
   const infoBoxRef = useRef();
   useOutsideClick(infoBoxRef, () => {setSubInfo(prev=>({...prev,Practice:false}));});
   
   sessionStorage.clear();

   useEffect(()=>{
      let isMounted = true;
      const controller = new AbortController();

      (async () => {
         try {
            const res = await axiosPrivate.get('/practice/data',
               { signal: controller.signal }
            );
            if (res.data.userPracticeData){
               isMounted && setProgressData(res.data.userPracticeData);
            }
         } catch (error) {
            if (!error?.response) {
               // toast.error('no server response');
               return;
            } else if(error.response?.status === 403){
               toast.error('Session Expired!');
            } else {
               toast.error('Somthing went wrong');
            }
            if (axios.isCancel(error)) {
               return
            }
         } finally {
            setLoading(false);
         }
      })();

      return () => {
         isMounted = false;
         controller.abort();
      }
   },[]);


   return (
      <div className="practice-top-layout">
         <div className="practice-container">
            <div className='practice-content-container'>
               <div className="practice-language-container">
                  {/* <h2 id="practice-language"> Start practice</h2> */}
                  <div className="practice-language-grid">
                     {languages.map((lang, index) => {
                        const progressLang = progressData.find((l) => l.language === lang.name);

                        const start = () =>{
                           if(!progressLang){
                              navigate(`/practiceques/${lang.name}`, { state: { fromPractice: true } });
                              sessionStorage.setItem("fromPractice", "true"); 
                           } else if(progressLang && progressLang.completed !== 3 && progressLang.solved !== progressLang.total){
                              navigate(`/practiceques/${lang.name}`, { state: { fromPractice: true } });
                              sessionStorage.setItem("fromPractice", "true"); 
                           } else if(progressLang && progressLang.completed === 3){
                              toast.success('🎯 Triple completion unlocked! Time to visit Settings and hit the reset button for a fresh start.')
                           } else{
                              toast.error('Somthing went wrong');
                           }
                        }
                        return (
                           <motion.div
                              variants={fadeUp}
                              initial="hidden"
                              // animate={index < 3 ? "visible" : undefined}
                              whileInView="visible"
                              viewport={{ once: true, margin: '-10px' }}
                              key={index}
                              whileHover={{ y: -8, boxShadow: lang.styles.boxShadow, transition: { duration: 0.1 } }}
                              className="practice-language-box"
                              onClick={start}>
                              <div className='practice-icon-div'>
                                 <lang.Icon className="practice-lang-icons" />
                                 <h3>{lang.name}</h3>
                              </div>
                              {loading
                                 ? <div className='practice-info-loader'>
                                    <p></p>
                                    <div></div>
                                    <span></span>
                                 </div>
                                 : <div className='practice-info'>
                                    <div className='practice-starPercent-div'>
                                       <div className="practice-stars" >
                                          {Array.from({ length: 3 }).map((_, i) =>(
                                             progressLang?.completed > i 
                                                ? <div className="practice-completeStar" key={i}>⭐</div>
                                                : <div className="practice-star" key={i}>☆</div>
                                          ))}
                                       </div>
                                       <p>{progressLang ? Math.round((progressLang.solved / progressLang.total) * 100) : 0}%</p>
                                    </div>
                                    <ProgressBar progress={progressLang ? Math.round((progressLang.solved / progressLang.total) * 100) : 0} />
                                    <span>{progressLang?.solved || 0}/{progressLang?.total || 400}</span>
                                 </div>
                              }
                           </motion.div>
                        )
                     })}
                  </div>
                  <p className='practice-endMessage' style={{color:'var(--text-color)'}}>Keep Practicing, Keep Growing!</p>
               </div>
            </div>
         </div>

         {subInfo?.Practice &&
            <div className='practice-infoBox-hiddenfield'>
               <div ref={infoBoxRef} className='practice-infoBox'>
                  <div>
                     <p>Practice Info</p>
                     <p onClick={() => setSubInfo(prev => ({ ...prev, 'Practice': false }))}>Got it</p>
                  </div>
                  <ul>
                     <li>You will get <b>20 unique questions</b> in every set. ✅</li>
                     <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                     <li>If you refresh during test, you'll be redirected back to home page and must reattempt. 🔄</li>
                     <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                     <li>Completing all questions will earn you a <b>Star</b>. ☆ → ⭐</li>
                  </ul>
               </div>
            </div>
         }
      </div>
   );
};

export default Practice;

