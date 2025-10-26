import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate, useParams, useBeforeUnload  } from "react-router-dom";
import "./practiceQues.css";
import { motion } from 'framer-motion'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Spinner from "../../loader/spinner";
import { toast } from 'react-toastify';

const PracticeQues = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]); // [{questionId, selectedOption}]
    const [loading, setLoading] = useState(true);
    const [submitloading, setSubmitloading] = useState(false);
    const [leave,setLeave] = useState(false);

    // Restore state from sessionStorage on mount
    const [sessionId, setSessionId] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [submitted, setSubmitted] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [results, setResults] = useState(null);

    const axiosPrivate = useAxiosPrivate();
    const { language } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const controllerRef = useRef(null);
    const scrollRef = useRef(null);
    const cameFromPractice = location.state?.fromPractice || sessionStorage.getItem("fromPractice");

    // 1 First mount: create new session if none exists
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (!cameFromPractice) {
            sessionStorage.clear();
            navigate("/", { replace: true }); // redirect home
            return;
        }
        sessionStorage.removeItem("fromPractice");

        if (!sessionId) {
            (async () => {
                setLoading(true);
                try {
                    const res = await axiosPrivate.post('/practice/questions',
                        { language, sessionId, cursor },
                        { signal: controller.signal }
                    );
                    if (isMounted) {
                        setSessionId(res.data.sessionId);
                        setCursor(res.data.cursor);
                        setQuestions(res.data?.questions);
                    }
                } catch (error) {
                    if (!error?.response) {
                        toast.error('no server response');
                    } else if (error.response?.status === 403) {
                        toast.error('Session Expired!');
                    } else {
                        toast.error('Somthing went wrong');
                    }
                    if (axios.isCancel(error)) {
                        console.log('Request cancled', error.message)
                        return
                    }
                } finally {
                    setLoading(false);
                }

            })();
        }else if (sessionId && cursor && !submitted) {
            (async () => {
                setLoading(true);
                try {
                    const res = await axiosPrivate.post('/practice/questions',
                        { language, sessionId, cursor },
                        { signal: controller.signal }
                    );
                    if (isMounted) {
                        setSessionId(res.data.sessionId);
                        setCursor(res.data.cursor);
                        setQuestions(res.data?.questions);
                    }
                } catch (error) {
                    if (!error?.response) {
                        toast.error('no server response');
                    } else if (error.response?.status === 403) {
                        toast.error('Session Expired!');
                    } else {
                        toast.error('Somthing went wrong');
                    }
                    if (axios.isCancel(error)) {
                        console.log('Request cancled', error.message)
                        return
                    }
                } finally {
                    setLoading(false);
                }
            })();
        }

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [submitted,language,navigate]);

    // update the user selected options in answers state
    const handleSelect = (questionId, option) => {
        setAnswers((prev) => {
            const existing = prev.find((a) => a.questionId === questionId);
            if (existing) {
                return prev.map((a) =>
                    a.questionId === questionId ? { ...a, selectedOption: option } : a
                );
            } else {
                return [...prev, { questionId, selectedOption: option }];
            }
        });
    };

    // Submit answers
    const handleSubmit = async () => {
        if(answers.length !== questions?.length){
            toast.error('Please solve all the questions before submit.');
            return;
        }
        controllerRef.current = new AbortController();
        setSubmitloading(true);
        try {
            const res = await axiosPrivate.post("/practice/submit",
                { sessionId, cursor, answers,language },
                { signal: controllerRef.current.signal }
            );
                
            if(res.status === 200 && res.data.message === 'Completed'){
                setSubmitted(true);
                setSubmitloading(false);
                setResults({
                    correctAnswers: res.data.correctAnswers,
                    totalQues: res.data.totalQues,
                    correctCount: res.data.correctCount,
                    explanations: res.data.explanations
                });
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
                }
                return;
            }

            if(res.status === 200){
                sessionStorage.setItem("fromPractice", "true");
                setSubmitted(true);
                setSubmitloading(false);
                setResults({
                    correctAnswers: res.data.correctAnswers,
                    totalQues: res.data.totalQues,
                    correctCount: res.data.correctCount,
                    explanations: res.data.explanations
                });
                setNextCursor(res.data.nextCursor);
            }
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (error) {
            if (!error?.response) {
                toast.error('no server response');
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message);
                navigate('/practice',{replace:true});
                sessionStorage.removeItem("fromPractice");
            } else if (error.response?.status === 403) {
                toast.error('Session Expired!');
            } else {
                toast.error('Somthing went wrong');
            }
            if (axios.isCancel(error)) {
                return
            }
        }
    };
    // Cleanup for handleSubmit when component unmounts → cancel request
    useEffect(() => {
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);

    // Move to next round
    const handleNext = () => {
        if (nextCursor) {
            sessionStorage.setItem("fromPractice", "true");
            setCursor(nextCursor);

            // Clear results + submitted state
            setSubmitted(false);
            setResults(null);
            setNextCursor(null);
            setAnswers([]);
            setQuestions([]);
        }
    };

    // Cancle
    const handleCancle = () => {
        if (nextCursor) {
            navigate(-1);
        }
    };

    // Back
    const handleBack = () => {
        navigate(-1); 
    };

    // Handle before unload (refresh, close)
    useBeforeUnload((event) => {
        event.preventDefault();
    });

    function handlePopState() {
        setLeave(true);
    }; 
    useEffect(()=>{
        // push a dummy state to the history stack
        window.history.pushState(null,'',window.location.pathname);   
        window.addEventListener('popstate',handlePopState);

    },[navigate]);
    const leaveConfirm = ()=>{
        setLeave(false);
        if (nextCursor) {
            navigate('/practice',{replace:true});
        }else{
            navigate('/practice', { replace: true,});
        } 
        navigate(-1); 
    };
    const leaveCancle = ()=>{
        setLeave(false);
        window.history.pushState(null,'',window.location.pathname);
    }

    return (
        <div className="practiceQues-main-container">
        <div className="practiceQues-container" ref={scrollRef}>
            <header>RecallCode</header>

            <h1 className="practiceQues-title">
                {language} ({questions?.length} Questions)
            </h1>

            <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '65%', margin: '10px auto' }} />

            <div className="practiceQues-progress">
                {!submitted
                    ?`${answers.length}/${questions?.length} Answered`
                    : <div className="practiceQues-top-message">
                        <div className="practiceQues-result">
                            <span>Correct: <span className="practiceQues-correctNo">{results && results.correctCount}</span></span>
                            <span>Wrong: <span className="practiceQues-wrongNo">{results && (results.totalQues-results.correctCount)}</span></span>
                        </div>
                        <div className="practiceQues-next-cancle-div">
                            {nextCursor
                                ?<>
                                    <button className="practiceQues-cancle-btn" onClick={() => handleCancle()}>Cancel</button>
                                    <button className="practiceQues-next-btn" onClick={() => handleNext()} >Next</button>
                                </>
                                :<>
                                    <p>Well Done!! You have completed all 400 Questions.</p>
                                    <button className="practiceQues-cancle-btn" onClick={() => handleBack()}>Back</button>
                                </> 
                            }
                        </div>
                    </div>
                }
            </div>
             
            {loading
              ?<div className="practiceQues-spinner-div"><Spinner color="var(--text-color)"/></div>
              :<div className="practiceQues-grid">
                {questions?.map((q, index) => {
                    const explanation = results?.explanations?.find((e) => e.questionId === q._id);

                    return(
                    <div key={q._id} className="practiceQues-question-card">
                        <div className="practiceQues-questions-div">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                // If your DB might have raw HTML in q.question, keep this true to ignore it
                                skipHtml={true}
                                components={{
                                    // Render paragraphs as divs to guarantee no <p><pre> nesting
                                    p: ({ children }) => <div className="practiceQues-paragraph">{children}</div>,

                                    // Let ReactMarkdown create <pre>, we only style it
                                    pre: ({ children, ...props }) => (
                                        <pre className="practiceQues-code-block" {...props}>{children}</pre>
                                    ),

                                    // Inline code vs block code
                                    code: ({ inline, className, children, ...props }) => {
                                        if (inline) {
                                            return (
                                                <code className="practiceQues-inline-code" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        // IMPORTANT: do NOT return <pre> here.
                                        return (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {`${index + 1}\\. ${q.question}`}
                            </ReactMarkdown>
                        </div>

                        <ul className="practiceQues-options">
                            {q.options.map((opt, i) => {
                                const selected = answers.find(
                                    (a) => a.questionId === q._id && a.selectedOption === opt
                                );

                                const result = results?.correctAnswers.find((r) => r.questionId === q._id);
                                const isCorrect = result?.correctOption === opt;

                                // Classes for indication
                                let optionClass = "";
                                if (result) {
                                    if (isCorrect) optionClass = "correct"; // green
                                    else if (selected) optionClass = "wrong"; // red
                                }

                                return (
                                    <li key={i}>
                                        <label className={`practiceQues-option-label ${optionClass}`}>
                                            <input
                                                type="checkbox"
                                                value={opt}
                                                checked={!!selected}
                                                disabled={!!result}
                                                onChange={() => handleSelect(q._id, opt)}
                                            />
                                            <span className="practiceQues-custom-radio"></span>
                                            <span className="practiceQues-optionName">{opt}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>

                        {submitted && explanation && 
                            <>
                            <div className="practiceQues-explaination">
                                <h3>Explaination:</h3>
                                <div><ReactMarkdown>{explanation.explain}</ReactMarkdown></div>
                            </div>
                            </>
                        }
                    </div>
                )})}
            </div>
            }

            {loading 
             ? null 
             :!submitted && questions?.length !== 0 &&
                <div className="practiceQues-submit-wrapper">
                    <button onClick={handleSubmit} className="practiceQues-submit-btn">
                        <span>Submit Answers {submitloading && <Spinner/>}</span>
                    </button>
                </div>
            }
        </div>
        {(leave) && (
                <motion.div
                    className="practiceQues-leave-field"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="practiceQues-leavebox"
                        initial={{ scale: 0.9, y: '-60%', x: '-50%' }}
                        animate={{ scale: 1, y: '-60%', x: '-50%' }}
                        // transition={{ duration: 0.25, ease: "easeOut" }}
                    >  
                        <div className="practiceQues-leave-message">
                            <p >Confirm Navigation</p>
                            <div >
                                Are you sure you want to leave this page?
                            </div>
                        </div>
                        
                        <div className="practiceQues-leave-buttons">
                            <button className="practiceQues-leave-confirm" onClick={() => leaveConfirm()}>
                                Confirm
                            </button>
                            <button className="practiceQues-leave-cancle" onClick={() => leaveCancle()}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default PracticeQues;

