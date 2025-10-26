import './trialQuestions.css';
import { useParams} from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Spinner from '../../../loader/spinner';
import { axiosBase } from '../../../api/customAxios';
import { toast } from 'react-toastify';

const TrialQues = () => {
    const { language } = useParams();

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const res = await axiosBase.get(`/trialQues/${language}`,
                    { signal: controller.signal }
                );
                if (res.data.questions) {
                    setQuestions(res.data.questions);
                }
            } catch (error) {
                if (!error?.response) {
                    toast.error('no server response');
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

    return (
        <div className="trialQues-main-container">
            <div className="trialQues-container">
                <header>RecallCode</header>
                <h1 className="trialQues-title">
                    {language} (Trial Questions)
                </h1>
                <div style={{ borderBottom: '1px solid var(--borderbold-color)', width: '65%', margin: '10px auto' }} />
                {loading
                    ? <div className="trialQues-spinner-div"><Spinner /></div>
                    : <div className="trialQues-grid">
                        {questions.map((q, index) => {
                           const answer = userAnswers.find((a) => a.questionId === q._id);

                            return (
                                <div key={q._id} className="trialQues-question-card">
                                    <div className="trialQues-questions-div">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            // If your DB might have raw HTML in q.question, keep this true to ignore it
                                            skipHtml={true}
                                            components={{
                                                // Render paragraphs as divs to guarantee no <p><pre> nesting
                                                p: ({ children }) => <div className="trialQues-paragraph">{children}</div>,

                                                // Let ReactMarkdown create <pre>, we only style it
                                                pre: ({ children, ...props }) => (
                                                    <pre className="trialQues-code-block" {...props}>{children}</pre>
                                                ),

                                                // Inline code vs block code
                                                code: ({ inline, className, children, ...props }) => {
                                                    if (inline) {
                                                        return (
                                                            <code className="trialQues-inline-code" {...props}>
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

                                    <ul className="trialQues-options">
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
                                                    <label className={`trialQues-option-label ${optionClass}`}>
                                                        <input
                                                            type="checkbox"
                                                            name={q._id}
                                                            value={opt}
                                                            checked={isSelected}
                                                            disabled={!!answer}
                                                            onChange={() => handleSelect(q._id, opt)}
                                                        />
                                                        <span className="trialQues-custom-radio"></span>
                                                        <span className="trialQues-optionName">{opt}</span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {!!answer &&
                                        <div className="trialQues-explaination">
                                            <h3>Explaination:</h3>
                                            <div><ReactMarkdown>{q.answer.explanation}</ReactMarkdown></div>
                                        </div>
                                    }
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
        </div>
    );
};


export default TrialQues;