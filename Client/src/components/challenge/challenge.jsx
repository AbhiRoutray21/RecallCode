import './challenge.css';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import languages from "../../utility/languagesArrary";
import { useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { toast } from 'react-toastify';
import useMainLayoutContext from '../../hooks/useMainLayoutContext';
import useOutsideClick from "../../hooks/useOutsideClick";
import { useRef } from 'react';
import ArrowSelector from '../../utility/ArrowSelector/arrowSelector';

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: {duration: 0.5,} },
    hover: { y: -8,}
};

const Challenge = () => {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { subInfo, setSubInfo } = useMainLayoutContext();
    const infoBoxRef = useRef();
    useOutsideClick(infoBoxRef, () => { setSubInfo(prev => ({ ...prev, Challenge: false })); });

    sessionStorage.clear();

    const defaultConfig = {
        difficulty: "Medium",
        questionCount: 10,
        mode: "Solo",
        timer: "15s",
    };

    const [configs, setConfigs] = useState(() => {
        const obj = {};
        languages.forEach(lang => {
            obj[lang.name] = { ...defaultConfig };
        });
        return obj;
    });

    const soloTimers = ["10s", "15s", "20s", "Adaptive"];
    const allTimers = ["5min", "7min", "10min", "Adaptive"];

    // --- Handles individual field change per language ---
    const handleChange = (langName, field, value) => {
        setConfigs(prev => {
            const updated = { ...prev };
            const current = updated[langName];

            if (field === "mode") {
                current.mode = value;
                current.timer = value === "Solo" ? "15s" : "5min";
            } else {
                current[field] = value;
            }

            updated[langName] = { ...current };
            return updated;
        });
    };

    // --- Start Challenge handler per language ---
    const handleStart = async (langName) => {
        // navigate(`/challengeques/${langName}`, {
        //     state: { 
        //         fromChallenge: true, 
        //         config: {
        //             difficulty: configs[langName].difficulty.toLowerCase(),
        //             questionCount: configs[langName].questionCount,
        //             mode: configs[langName].mode,
        //             timer: configs[langName].timer,
        //         } 
        //     }
        // });
        navigate("#challengeQues");
    };


    return (
        <div className="challenge-top-layout">
          <div className="challenge-container">
            <div className='challenge-content-container'>
              <div className="challenge-language-container">
                {/* <h2 id="challenge-language"> Start challenge</h2> */}
                <div className="challenge-language-grid">
                    {languages.map((lang, index) => {
                        const cfg = configs[lang.name];
                        const currentTimerOptions = cfg.mode === "Solo" ? soloTimers : allTimers;

                        return (
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                // animate={index < 3 ? "visible" : undefined}
                                whileInView="visible"
                                viewport={{ once: true, margin: '-10px' }}
                                key={index}
                                className="challenge-language-box"
                            >
                                <div className='challenge-icon-div'>
                                    <lang.Icon className="challenge-lang-icons" />
                                    <h3>{lang.name}</h3>
                                </div>


                                {/* Challenge Config Section */}
                                <div className="challenge-config">
                                    <div className="config-item">
                                        <span>Difficulty:</span>
                                        <ArrowSelector
                                            values={["Easy", "Medium", "Hard", "Mixed"]}
                                            value={cfg.difficulty}
                                            onChange={(val) => handleChange(lang.name, "difficulty", val)}
                                            loop
                                        />
                                    </div>

                                    <div className="config-item">
                                        <span>Questions:</span>
                                        <ArrowSelector
                                            values={[10, 15, 20]}
                                            value={cfg.questionCount}
                                            onChange={(val) => handleChange(lang.name,"questionCount", val)}
                                            loop
                                        />
                                    </div>

                                    <div className="config-item">
                                        <span>Mode:</span>
                                        <ArrowSelector
                                            values={["Solo", "All"]}
                                            value={cfg.mode}
                                            onChange={(val) => handleChange(lang.name,"mode", val)}
                                            loop
                                        />
                                    </div>

                                    <div className="config-item">
                                        <span>Timer:</span>
                                        <ArrowSelector
                                            values={currentTimerOptions}
                                            value={cfg.timer}
                                            onChange={(val) => handleChange(lang.name,"timer", val)}
                                            loop
                                        />
                                    </div>
                                </div>
                                
                                <button className="challenge-start-btn" onClick={() => handleStart(lang.name)}>
                                    Start
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
              </div>
            </div>
          </div>

            {subInfo?.Challenge &&
                <div className='challenge-infoBox-hiddenfield'>
                    <div ref={infoBoxRef} className='challenge-infoBox'>
                        <div>
                            <p>Challenge Info</p>
                            <p onClick={() => setSubInfo(prev => ({ ...prev, 'Challenge': false }))}>Got it</p>
                        </div>
                        <ul>
                            <li>Adjust <b>Difficulty</b>, <b>Questions</b>, <b>Mode</b>, and <b>Timer</b> to design your own challenging test.</li>
                            <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                            <li>You must answer all questions to complete the challenge ✅</li>
                            <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                            <li>Skipping a question or running out of time counts as incorrect ❌</li>
                            <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />    
                            <li>Scores are calculated based on accuracy and time efficiency ⭐</li>
                            <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                            <li>Once the challenge starts, settings cannot be changed 🔒</li>
                            <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '95%', margin: '10px auto' }} />
                            <li>Refreshing or leaving the page will end the challenge 🚫</li>
                        </ul>
                    </div>
                </div>
            }
        </div>
    );
};

export default Challenge;

