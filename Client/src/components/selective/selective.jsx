import './selective.css';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import languages from '../../utility/languagesArrary';
import { useEffect, useState } from 'react';
import LevelBar from '../../utility/levelbar/levelBar';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axios from "axios";
import { BiSolidLeftArrow,BiSolidRightArrow} from "react-icons/bi";
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

const Selective = () => {
   const axiosPrivate = useAxiosPrivate();
   const navigate = useNavigate();
   const [selectiveTopics, setSelectiveTopics] = useState([]);
   const [selectedLang, setSelectedLang] = useState(null); // which language is active
   const [selectedTopics, setSelectedTopics] = useState([]); // topics for that language
   const [quesPerTopic, setQuesPerTopic] = useState({}); 
   const [loading, setLoading] = useState(true);

   const {subInfo,setSubInfo} = useMainLayoutContext();
   const infoBoxRef = useRef();
   useOutsideClick(infoBoxRef, () => {setSubInfo(prev=>({...prev,Selective:false}));});

   const [pageIndex, setPageIndex] = useState({});
   const itemsPerPage = 5;;
   
   sessionStorage.clear();

   useEffect(()=>{
      let isMounted = true;
      const controller = new AbortController();

      (async () => {
         try {
            const res = await axiosPrivate.get('/selective/topics',
               { signal: controller.signal }
            );
            if (res.data.selectiveTopics){
               isMounted && setSelectiveTopics(res.data.selectiveTopics);
            }
         } catch (error) {
            if (!error?.response) {
               // toast.error('no server response');
               return;
            } else if (error.response?.status === 403) {
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

   useEffect(() => {
      if (!selectedLang) return;

      const perTopic = quesPerTopic[selectedLang] ?? 5;
      const maxTopics = Math.floor(30 / perTopic);

      setSelectedTopics(prev => {
         if (prev.length <= maxTopics) return prev;

         // Trim: keep earliest selected. If you'd rather keep the most recent selections, use prev.slice(-maxTopics)
         return prev.slice(0, maxTopics);
      });
   }, [selectedLang, quesPerTopic]);

   const handleChange = (langName, topic) => {
      const perTopic = quesPerTopic[langName] || 5; // default 5 if not set
      const maxTopics = Math.floor(30 / perTopic);

      if (selectedLang !== langName) {
         // switching to a new language → reset topics
         setSelectedLang(langName);
         setSelectedTopics([topic]);
      } else {
         // same language → toggle topic
         setSelectedTopics((prev) => {
            if (prev.includes(topic)) {
               // deselect
               return prev.filter((t) => t !== topic);
            } else {
               // add, but enforce limit
               if (prev.length >= maxTopics) {
                  return prev; // do nothing
               }
               return [...prev, topic];
            }
         });
      }
   };

   const start = (langName) => {
      const perTopic = quesPerTopic[langName] || 5;
      const topicsQuery = selectedTopics
         .map(topic => `topic=${encodeURIComponent(topic)}`)
         .join("&");

      if (langName === selectedLang && selectedTopics.length !== 0) {
         navigate(`/selectiveques/${langName}?${topicsQuery}&quesPerTopic=${perTopic}`,
            { state: { fromSelective: true } });
         sessionStorage.setItem("fromSelective", "true");
      } else toast.error('Please select at least one topic for the respective section to start.');
   };

   
   return (
      <div className="selective-top-layout">
      <div className="selective-container">
         <div className='selective-content-container'>
               <div className="selective-language-grid">
                  {languages.map((lang, index) => {
                     const currentIndex = pageIndex[lang.name] || 0;
                     const startIndex = currentIndex * itemsPerPage;
                     const visibleTopics = selectiveTopics.find(st => st.language === lang.name)?.topics.slice(startIndex, startIndex + itemsPerPage);
                     const totalPages = Math.ceil(selectiveTopics.find(st => st.language === lang.name)?.topics.length / itemsPerPage);

                     const next = () => {
                        setPageIndex(prev => {
                           const current = prev[lang.name] || 0;
                           if (current < totalPages - 1) {
                              return { ...prev, [lang.name]: current + 1 };
                           }
                           return prev;
                        });
                     };

                     const prev = () => {
                        setPageIndex(prev => {
                           const current = prev[lang.name] || 0;
                           if (current > 0) {
                              return { ...prev, [lang.name]: current - 1 };
                           }
                           return prev;
                        });
                     };
                     
                     return (
                        <motion.div
                           variants={fadeUp}
                           initial={"hidden"}
                           whileInView="visible"
                           viewport={{ once: true, margin: '-10px' }}
                           key={index}
                           className="selective-language-box">
                            <div className='selective-box-left'>
                                <div className='selective-icon-div'>
                                    <div className="selective-lang-icons-div"> 
                                        <lang.Icon className="selective-lang-icons" />
                                    </div>
                                    <h3>{lang.name}</h3>
                                    <p>Questions from each topic:</p>
                                    <LevelBar
                                       onChange={(val) => setQuesPerTopic(prev => ({ ...prev, [lang.name]: val }))}
                                    />
                                </div> 
                                <button className='start-btn' onClick={()=>start(lang.name)}>Start</button>
                           </div>
                           <div className='selective-box-right'>
                              {loading
                                ?<div className='selective-topics-box-loader'>
                                    <div className='selective-topic-loader sltopic1'></div>
                                    <div className='selective-topic-loader sltopic2'></div>    
                                    <div className='selective-topic-loader sltopic3'></div>    
                                    <div className='selective-topic-loader sltopic4'></div>    
                                    <div className='selective-topic-loader sltopic5'></div>    
                                </div>
                                :<>
                                <div className='topics-arrowLeft-btn' onClick={prev} disabled={currentIndex === 0}><BiSolidLeftArrow className='topics-arrow'/></div>
                                 <div className='selective-topics-box'>
                                    {visibleTopics?.map((topic, i) => {
                                       const currentPerTopic = quesPerTopic[lang.name] ?? 5;
                                       const currentMax = Math.floor(30 / currentPerTopic);

                                       const isChecked = selectedLang === lang.name && selectedTopics.includes(topic);
                                       const isDisabled = selectedLang === lang.name && !isChecked && selectedTopics.length >= currentMax;

                                       return (
                                          <label key={i} >
                                             <input
                                                type="checkbox"
                                                checked={isChecked}
                                                disabled={isDisabled}
                                                onChange={() => handleChange(lang.name, topic)}
                                             />
                                             <span className="checkmark" />
                                             <p className="topicName">{topic}</p>
                                          </label>
                                       );
                                    })}
                                 </div>
                                 <div className='topics-arrowRight-btn' onClick={next} disabled={currentIndex === 0}><BiSolidRightArrow className='topics-arrow'/></div>
                                 </>
                              }
                           </div>
                        </motion.div>
                     )
                  })}
               </div>
         </div>
      </div>
         {subInfo?.Selective &&
            <div className='selective-infoBox-hiddenfield'>
               <div ref={infoBoxRef} className='selective-infoBox'>
                  <div className='selective-info-head'>
                     <p>Selective Info</p>
                     <p onClick={() => setSubInfo(prev => ({ ...prev, Selective: false }))}>Got it</p>
                  </div>
                  <ul>
                     <li>Use the <b>slider</b> to select how many questions you want. 🎚️</li>
                     <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                     <li>
                        Selection limits: 📊
                        <p className='selection-limit'>5 Questions → Max 6 Topics</p>
                        <p className='selection-limit'>10 Questions → Max 3 Topics</p>
                        <p className='selection-limit'>15 Questions → Max 2 Topics</p>
                        <p className='selection-limit'>20 Questions → 1 Topic only</p>
                     </li>
                     <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                     <li>you can only select topics from a single language — no mixing between languages. 🚫</li>
                  </ul>
               </div>
            </div>
         }
      </div>
   );
};

export default Selective;
