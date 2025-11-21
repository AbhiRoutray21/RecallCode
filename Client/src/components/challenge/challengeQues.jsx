import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./challengeQues.css";
import { motion } from 'framer-motion';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Spinner from "../../loader/spinner";
import { toast } from 'react-toastify';

/**
 * Simplified ChallengeQues.jsx
 * - No session persistence
 * - Uses only fromChallenge flag
 * - Global timer (read from config)
 * - Shows instant answers (correct/wrong + explanation)
 * - At end, only shows Correct/Wrong counts
 */

const parseTimerString = (timerStr, difficulty, questionCount) => {
  if (!timerStr) return 5 * 60;
  const s = String(timerStr).trim().toLowerCase();

  if (s === "adaptive") {
    const base = difficulty === "Hard" ? 20 : difficulty === "Medium" ? 15 : 10;
    return Math.max(30, Math.round(base * (questionCount || 10)));
  }

  if (s.endsWith("min")) {
    const n = parseFloat(s.replace("min", ""));
    if (!isNaN(n)) return Math.round(n * 60);
  }

  if (s.endsWith("s")) {
    const n = parseFloat(s.replace("s", ""));
    if (!isNaN(n)) return Math.round(n);
  }

  const n = parseFloat(s);
  if (!isNaN(n)) return Math.round(n);

  return 5 * 60;
};

const ChallengeQues = () => {
  const axiosPrivate = useAxiosPrivate();
  const { language } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const cameFromChallenge = location.state?.fromChallenge;
  const config = location.state?.config; // { difficulty, questionCount, timer }

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // {questionId, selectedOption}
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState({ correct: 0, wrong: 0 });

  const [remaining, setRemaining] = useState(() =>
    config ? parseTimerString(config.timer, config.difficulty, config.questionCount) : 0
  );
  const timerRef = useRef(null);

  // Block direct access
  useEffect(() => {
    if (!cameFromChallenge || !config) {
      navigate("/challenge", { replace: true });
    }
  }, [cameFromChallenge, config, navigate]);

  // Fetch questions
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const payload = {
          languageName: language,
          difficulty: config?.difficulty,
          questionCount: config?.questionCount,
          mode: "All",
          timer: config?.timer
        };

        const res = await axiosPrivate.post("/challenge/questions", payload, { signal: controller.signal });
        if (isMounted) setQuestions(res.data?.questions || []);
      } catch (error) {
        if (axios.isCancel(error)) return;
        if (!error?.response) toast.error("No server response");
        else if (error.response?.status === 403) toast.error("Session expired!");
        else toast.error("Failed to load challenge questions");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuestions();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate, language, config]);

  // Global countdown timer
  useEffect(() => {
    if (questions.length === 0 || !remaining || remaining <= 0 || submitted ) return;

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finalizeResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [remaining, submitted, questions]);    

  // Handle answer select (instant feedback)
  const handleSelect = (questionId, option) => {
    if (answers.find((a) => a.questionId === questionId)) return; // already answered

    setAnswers((prev) => {
      const updated = [...prev, { questionId, selectedOption: option }];
      if (updated.length === questions.length) finalizeResults(false, updated);
      return updated;
    });
  };

  const finalizeResults = (timeUp = false, latestAnswers = null) => {
    if (submitted) return;
    const finalAnswers = latestAnswers || answers;
    const total = questions.length;

    let correct = 0;
    finalAnswers.forEach((a) => {
      const q = questions.find((q) => q._id === a.questionId);
      if (q && q.answer && a.selectedOption === q.answer.option) correct++;
    });

    const wrong = finalAnswers.length - correct;
    const notAnswered = total - finalAnswers.length;

    setResults({ correct, wrong, notAnswered });
    setSubmitted(true);
    clearInterval(timerRef.current);
  };

  const handleBack = () => {
    navigate("/challenge", { replace: true });
  };

  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getAnswer = (id) => answers.find((a) => a.questionId === id);

  return (
    <div className="challengeQues-main-container">
      <div className="challengeQues-container">
        <header>RecallCode</header>

        <h1 className="challengeQues-title">
          {language} ({questions?.length || 0} Questions)
        </h1>

        <div style={{ borderBottom: "1px solid var(--borderbold-color)", width: "65%", margin: "10px auto" }} />

        <div className="challengeQues-progress">
          {!submitted ? (
            <>
              <div>{answers.length}/{questions.length} Answered</div>
              <div style={{ marginTop: 6 }}>Time left: <strong>{formatTime(remaining)}</strong></div>
            </>
          ) : (
            <div className="challengeQues-top-message">
              <div className="challengeQues-result">
                <span>Correct: <span className="challengeQues-correctNo">{results.correct}</span></span>
                <span>Wrong: <span className="challengeQues-wrongNo">{results.wrong}</span></span>
                <span>Not Answered: <span className="challengeQues-notAnsweredNo">{results.notAnswered}</span></span>
              </div>
              <button className="challengeQues-cancle-btn" onClick={handleBack}>Back</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="challengeQues-spinner-div"><Spinner color="var(--text-color)" /></div>
        ) : (
          <div className="challengeQues-grid">
            {questions.map((q, index) => {
              const answer = getAnswer(q._id);
              const isAnswered = !!answer;
              const selected = answer?.selectedOption;

              return (
                <div key={q._id} className="challengeQues-question-card">
                  <div className="challengeQues-questions-div">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      skipHtml={true}
                      components={{
                        p: ({ children }) => <div className="challengeQues-paragraph">{children}</div>,
                        pre: ({ children, ...props }) => <pre className="challengeQues-code-block" {...props}>{children}</pre>,
                        code: ({ inline, className, children, ...props }) =>
                          inline
                            ? <code className="challengeQues-inline-code" {...props}>{children}</code>
                            : <code className={className} {...props}>{children}</code>,
                        a: ({ children }) => <span>{children}</span>,
                      }}
                    >
                      {`${index + 1}\\. ${q.question}`}
                    </ReactMarkdown>
                  </div>

                  <ul className="challengeQues-options">
                    {q.options.map((opt, i) => {
                      const isSelected = selected === opt;
                      const isCorrect = q.answer && opt === q.answer.option;
                      const isWrong = isAnswered && isSelected && !isCorrect;

                      let cls = "";
                      if (isAnswered) {
                        if (isCorrect) cls = "correct";
                        else if (isWrong) cls = "wrong";
                      }

                      return (
                        <li key={i}>
                          <label className={`challengeQues-option-label ${cls}`}>
                            <input
                              type="radio"
                              name={`q_${q._id}`}
                              value={opt}
                              checked={isSelected}
                              disabled={isAnswered || submitted}
                              onChange={() => handleSelect(q._id, opt)}
                            />
                            <span className="challengeQues-custom-radio"></span>
                            <span className="challengeQues-optionName">{opt}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  {isAnswered && q.answer?.explanation && (
                    <div className="challengeQues-explaination">
                      <h3>Explanation:</h3>
                      <div><ReactMarkdown>{q.answer.explanation}</ReactMarkdown></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeQues;
