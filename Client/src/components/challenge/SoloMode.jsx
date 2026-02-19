import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SoloMode = ({
    questions,
    config,
    submitted,
    results,
    handleSelect,
    handleSubmit,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState(null);

    const currentQuestion = questions[currentIndex];

    // 🧠 Determine per-question time
    const getPerQuestionTime = () => {
        if (config?.timer !== "adaptive") {
            if (config?.timer?.endsWith("s"))
                return parseInt(config.timer);

            return parseInt(config.timer) || 15;
        }

        // Adaptive logic
        switch (config?.difficulty?.toLowerCase()) {
            case "easy":
                return 10;
            case "medium":
                return 15;
            case "hard":
                return 20;
            default:
                return 15;
        }
    };

    // 🔁 Reset timer when question changes
    useEffect(() => {
        if (!currentQuestion || submitted) return;

        setSelectedOption(null);

        const perTime = getPerQuestionTime();
        setTimeLeft(perTime);

        clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    goNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, submitted]);

    const goNext = () => {
        if (currentIndex + 1 >= questions.length) {
            handleSubmit(false);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (!selectedOption) return;

        const updated = handleSelect(currentQuestion._id, selectedOption);

        if (currentIndex + 1 >= questions.length) {
            handleSubmit(false, updated);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const formatTime = (seconds) => {
        const mm = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");

        const ss = (seconds % 60)
            .toString()
            .padStart(2, "0");

        return `${mm}:${ss}`;
    };

    // After submission → show All questions view
    if (submitted) {
        return (
            <div className="challengeQues-grid">
                {questions.map((q, index) => {
                    const resultData = results?.detailedResults?.find(
                        (r) => r.questionId === q._id
                    );

                    return (
                        <div
                            key={q._id}
                            className="challengeQues-question-card"
                        >
                            <div className="challengeQues-solo-infobar">
                                <div>
                                    {currentQuestion?.difficulty
                                        ? currentQuestion.difficulty.charAt(0).toUpperCase() +
                                        currentQuestion.difficulty.slice(1).toLowerCase()
                                        : ""}
                                </div>
                            </div>
                            <div className="challengeQues-questions-div">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    skipHtml={true}
                                    components={{
                                        p: ({ children }) => (
                                            <div className="challengeQues-paragraph">
                                                {children}
                                            </div>
                                        ),
                                        pre: ({ children, ...props }) => (
                                            <pre
                                                className="challengeQues-code-block"
                                                {...props}
                                            >
                                                {children}
                                            </pre>
                                        ),
                                        code: ({
                                            inline,
                                            className,
                                            children,
                                            ...props
                                        }) =>
                                            inline ? (
                                                <code
                                                    className="challengeQues-inline-code"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            ) : (
                                                <code
                                                    className={className}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            ),
                                        a: ({ children }) => <span>{children}</span>,
                                    }}
                                >
                                    {`${index + 1}\\. ${q.question}`}
                                </ReactMarkdown>
                            </div>

                            <ul className="challengeQues-options">
                                {q.options.map((opt, i) => {
                                    let cls = "";

                                    if (resultData) {
                                        if (opt === resultData.correctOption)
                                            cls = "correct";

                                        if (
                                            opt === resultData.selectedOption &&
                                            !resultData.isCorrect
                                        )
                                            cls = "wrong";
                                    }

                                    return (
                                        <li key={i}>
                                            <label
                                                className={`challengeQues-option-label ${cls}`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={opt}
                                                    checked={opt === resultData?.selectedOption}
                                                    disabled
                                                />
                                                <span className="challengeQues-custom-radio"></span>
                                                <span className="challengeQues-optionName">
                                                    {opt}
                                                </span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                            {resultData?.explanation && (
                                <div className="challengeQues-explaination">
                                    <h3>Explanation:</h3>
                                    <ReactMarkdown>
                                        {resultData.explanation}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // 🧍 Active Solo Question
    return (
        <div key={currentQuestion._id} className="challengeQues-solo-question-card">
            <div className="challengeQues-solo-infobar">
                <div>
                    {currentQuestion?.difficulty
                        ? currentQuestion.difficulty.charAt(0).toUpperCase() +
                        currentQuestion.difficulty.slice(1).toLowerCase()
                        : ""}
                </div>
                <div>
                    <span style={{
                        color: timeLeft <= 5 ? "#e74c3c" : "inherit"
                    }}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            {currentQuestion && (
                <>
                    <div className="challengeQues-questions-div">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            skipHtml={true}
                            components={{
                                p: ({ children }) => (
                                    <div className="challengeQues-paragraph">
                                        {children}
                                    </div>
                                ),
                                pre: ({ children, ...props }) => (
                                    <pre
                                        className="challengeQues-code-block"
                                        {...props}
                                    >
                                        {children}
                                    </pre>
                                ),
                                code: ({
                                    inline,
                                    className,
                                    children,
                                    ...props
                                }) =>
                                    inline ? (
                                        <code
                                            className="challengeQues-inline-code"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ) : (
                                        <code
                                            className={className}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ),
                                a: ({ children }) => <span>{children}</span>,
                            }}
                        >
                            {`${currentIndex + 1}\\. ${currentQuestion.question}`}
                        </ReactMarkdown>
                    </div>

                    <ul className="challengeQues-options">
                        {currentQuestion.options.map((opt, i) => (
                            <li key={i}>
                                <label className="challengeQues-option-label">
                                    <input
                                        type="radio"
                                        name={`solo_q_${currentQuestion._id}`}
                                        value={opt}
                                        checked={selectedOption === opt}
                                        onChange={() => setSelectedOption(opt)}
                                    />
                                    <span className="challengeQues-custom-radio"></span>
                                    <span className="challengeQues-optionName">
                                        {opt}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    <div className="challengeQues-next-div">
                        <button
                            disabled={!selectedOption}
                            onClick={handleNext}
                            className="challengeQues-next-btn"
                        >
                            {currentIndex + 1 >= questions.length ? "Submit" : "Next"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SoloMode;
