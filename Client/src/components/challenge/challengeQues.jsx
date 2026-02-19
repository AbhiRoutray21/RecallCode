import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./challengeQues.css";
import Spinner from "../../loader/spinner";
import { toast } from "react-toastify";
import AllMode from "./AllMode";
import SoloMode from "./SoloMode";

const parseAllModeTimer = (difficulty, timerType) => {
  if (timerType !== "adaptive") return null;

  switch (difficulty?.toLowerCase()) {
    case "easy":
      return 5 * 60;     // 5 minutes
    case "medium":
      return 7 * 60;     // 7 minutes
    case "hard":
      return 10 * 60;    // 10 minutes
    default:
      return 5 * 60;
  }
};

const ChallengeQues = () => {
  const axiosPrivate = useAxiosPrivate();
  const { language } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const config = location.state?.config;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const answersRef = useRef(answers);
  const submittedRef = useRef(submitted);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  const initialTime = useRef(0);

  const [remaining, setRemaining] = useState(() => {
    if (!config) return 0;

    if (config.timer === "adaptive" && config.mode === "All") {
      return parseAllModeTimer(config.difficulty, "adaptive");
    }

    if (config.timer?.endsWith("min"))
      return parseInt(config.timer) * 60;

    if (config.timer?.endsWith("s"))
      return parseInt(config.timer);

    return parseInt(config.timer) || 0;
  });

  useEffect(() => {
    if (config?.mode === "All") {
      initialTime.current = remaining;
    }
  }, []);

  const initialTimeRef = useRef(initialTime);

  const timerRef = useRef(null);

  // Access Guard useEffect
  useEffect(() => {
    const flag = localStorage.getItem("cameFromChallenge");

    if (!flag || !config) {
      navigate("/challenge", { replace: true });
    }
  }, [config, navigate]);

  // Fetch questions (answers NOT included now)
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
          timer: config?.timer,
        };

        const res = await axiosPrivate.post(
          "/challenge/questions",
          payload,
          { signal: controller.signal }
        );

        if (isMounted) {
          setQuestions(res.data?.questions || []);

          // ✅ Remove flag after successful fetch
          localStorage.removeItem("cameFromChallenge");
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        toast.error("Failed to load challenge questions");
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

  // Clean timer (no recreation every second)
  useEffect(() => {
    if (config?.mode !== "All") return;
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);

          if (!submittedRef.current) {
            handleSubmit(true, answersRef.current);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questions.length, config?.mode]);


  const handleSelect = (questionId, option) => {
    if (submitted) return [];

    let updatedAnswers = [];

    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        updatedAnswers = prev;
        return prev;
      }

      updatedAnswers = [...prev, { questionId, selectedOption: option }];

      if (
        config?.mode === "All" &&
        updatedAnswers.length === questions.length
      ) {
        handleSubmit(false, updatedAnswers);
      }

      return updatedAnswers;
    });

    return updatedAnswers;
  };

  const handleSubmit = async (timeUp = false, latestAnswers = null) => {
    if (submittedRef.current) return;

    const finalAnswers = latestAnswers || answersRef.current;
    const totalTimeTaken =
      config?.mode === "All"
        ? initialTime.current - remaining
        : 0; // Solo calculates separately

    try {
      const res = await axiosPrivate.post("/challenge/submit", {
        answers: finalAnswers,
        totalQuestions: questions.length,
        totalTimeTaken,
      });

      setResults(res.data);
      setSubmitted(true);
      clearInterval(timerRef.current);
    } catch (err) {
      toast.error("Failed to submit challenge");
    }
  };


  const formatTime = (s) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="challengeQues-main-container">
      <div className="challengeQues-container">
        <header>RecallCode</header>

        <h1 className="challengeQues-title">
          {language} ({questions?.length || 0} Questions)
        </h1>

        <div className="challengeQues-progress">
          {!submitted ? (
            <>
              <div>
                {answers.length}/{questions.length} Answered
              </div>
              {config?.mode == "All" && 
              <div className="challengeQues-progress-globaltimer">
                Time left: <strong>{formatTime(remaining)}</strong>
              </div>}
            </>
          ) : (
            <div  className="challengeQues-score">
              <span>Correct: <span className="challengeQues-correctNo">{results.correct}</span> </span>
              <span> Wrong: <span className="challengeQues-wrongNo">{results.wrong}</span></span>
              <span> Not Attempted: <span>{results.notAttempted}</span></span>
              <span> Score: {results.percentage}%</span>
              <span>
                Total Time: {Math.floor(results.totalTimeTaken / 60)}m{" "}
                {results.totalTimeTaken % 60}s
              </span>
              <span>
                Avg / Question: {results.avgTimePerQuestion}s
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {config?.mode === "All" && (
              <AllMode
                questions={questions}
                answers={answers}
                submitted={submitted}
                results={results}
                handleSelect={handleSelect}
              />
            )}

            {config?.mode === "Solo" && (
              <SoloMode
                questions={questions}
                config={config}
                submitted={submitted}
                results={results}
                handleSelect={handleSelect}
                handleSubmit={handleSubmit}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChallengeQues;
