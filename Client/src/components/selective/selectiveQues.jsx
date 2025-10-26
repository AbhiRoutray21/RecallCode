import './selectiveQues.css';
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, Fragment } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Spinner from '../../loader/spinner';
import { toast } from 'react-toastify';

const SelectiveQues = () => {
    const axiosPrivate = useAxiosPrivate();
    const [searchParams] = useSearchParams();
    const topics = searchParams.getAll("topic");
    const quesPerTopic = searchParams.get("quesPerTopic");
    const { language } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const cameFromSelective = location.state?.fromSelective || sessionStorage.getItem("fromSelective");

    const [questions, setQuestions] = useState(() => safeParse(sessionStorage.getItem("questions"))??{});
    const [userAnswers, setUserAnswers] = useState(() => safeParse(sessionStorage.getItem("answers"))??[]);
    const [loading, setLoading] = useState(true);
    window.history.replaceState({}, "", window.location.pathname);

    const allQuestions = Object.values(questions).flat();

     // helper
    function safeParse(item){
        try {
            return item && item !== "undefined" ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        if (!cameFromSelective) {
            sessionStorage.clear();
            navigate("/", { replace: true }); // redirect home
            return;
        }
        
        if(Object.values(questions).length === 0){
            (async () => {
                try {
                    const res = await axiosPrivate.post('/selective/questions',
                        { language, topics, quesPerTopic },
                        { signal: controller.signal }
                    );
                    if (res.data.Questions) {
                        setQuestions(res.data.Questions);
                        sessionStorage.setItem('questions', JSON.stringify(res.data.Questions));
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
        }else{
          setLoading(false);
        }
        return () => {
            controller.abort();
        }
    }, []);

    // update the user selected options in answers state
    const handleSelect = (questionId, option) => {
        setUserAnswers((prev) => {
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

    const handleBack = ()=>{
       sessionStorage.clear();
       navigate('/selective',{replace:true});
    };

    sessionStorage.setItem('answers', JSON.stringify(userAnswers));

    const correctCount = userAnswers.filter(ans => {
        const q = allQuestions.find(q => q._id === ans.questionId);
        return q && ans.selectedOption === q.answer.option;
    }).length;
    const wrongCount = userAnswers.length - correctCount;


    return (
        <div className="selectiveQues-main-container">
            <div className="selectiveQues-container">
                <header>RecallCode</header>
                <h1 className="selectiveQues-title">
                    {language} (Selective Questions)
                </h1>
                <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '65%', margin: '10px auto' }} />
                <div className="selectiveQues-progress">
                    {(userAnswers.length === 0 || !(userAnswers.length === allQuestions.length)) 
                      ?`${userAnswers.length}/${allQuestions.length} Answered` 
                      : <><div className="selectiveQues-result">
                            <span>Correct: <span className="selectiveQues-correctNo">{correctCount}</span></span>
                            <span>Wrong: <span className="selectiveQues-wrongNo">{wrongCount}</span></span>
                        </div>
                        <div className="selectiveQues-message-div">
                            <p>Completed</p>
                            <button className="selectiveQues-back-btn" onClick={() => handleBack()}>Back</button>
                        </div></>
                    }       
                </div>
                {loading
                  ?<div className="selectiveQues-spinner-div"><Spinner color="var(--text-color)"/></div>
                  :<div className="selectiveQues-grid">
                    {Object.keys(questions)?.map((topic, tindex) => (
                        <Fragment key={topic}>
                            {questions[topic].map((q, qindex) => {
                                const answer = userAnswers.find((a) => a.questionId === q._id);
                                
                                return (
                                    <div key={qindex} className="selectiveQues-question-card">
                                        
                                        <p>{topic}</p>
                                
                                        <div className="selectiveQues-questions-div">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                // If your DB might have raw HTML in q.question, keep this true to ignore it
                                                skipHtml={true}
                                                components={{
                                                    // Render paragraphs as divs to guarantee no <p><pre> nesting
                                                    p: ({ children }) => <div className="selectiveQues-paragraph">{children}</div>,
                                                    // Let ReactMarkdown create <pre>, we only style it
                                                    pre: ({ children, ...props }) => (
                                                        <pre className="selectiveQues-code-block" {...props}>{children}</pre>
                                                    ),
                                                    // Inline code vs block code
                                                    code: ({ inline, className, children, ...props }) => {
                                                        if (inline) {
                                                            return (
                                                                <code className="selectiveQues-inline-code" {...props}>
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
                                                {`${tindex + 1}\\.${qindex + 1}\\. ${q.question}`}
                                            </ReactMarkdown>
                                        </div>
                                        <ul className="selectiveQues-options">
                                            {q.options.map((opt, i) => {
                                                const isSelected = answer?.selectedOption === opt;
                                                const isCorrect = opt === q.answer.option; 
                                                const isWrongSelected = isSelected && !isCorrect;

                                                // Decide className based on conditions
                                                let optionClass = "";
                                                if (answer) {
                                                    if (isCorrect) optionClass = "correct";
                                                    else if (isWrongSelected) optionClass = "wrong";
                                                }
                                                return (
                                                    <li key={i}>
                                                        <label className={`selectiveQues-option-label ${optionClass}`}>
                                                            <input
                                                                type="checkbox"
                                                                value={opt}
                                                                checked={isSelected}
                                                                disabled={!!answer} // disable after first attempt
                                                                onChange={() => handleSelect(q._id, opt)} 
                                                            />
                                                            <span className="selectiveQues-custom-radio"></span>
                                                            <span className="selectiveQues-optionName">{opt}</span>
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        
                                        {!!answer && 
                                            <div className="selectiveQues-explaination">
                                                <h3>Explaination:</h3>
                                                <div><ReactMarkdown>{q.answer.explanation}</ReactMarkdown></div>
                                            </div>
                                        }
                                    </div>
                                )
                            })}
                        </Fragment>
                    ))}
                </div>
                }
            </div>
        </div>
    );
};


export default SelectiveQues;