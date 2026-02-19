import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AllMode = ({
  questions,
  answers,
  submitted,
  results,
  handleSelect,
}) => {
  const getAnswer = (id) =>
    answers.find((a) => a.questionId === id);

  return (
    <div className="challengeQues-grid">
      {questions.map((q, index) => {
        const answer = getAnswer(q._id);
        const selected = answer?.selectedOption;

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
                    {q?.difficulty
                        ? q.difficulty.charAt(0).toUpperCase() +
                        q.difficulty.slice(1).toLowerCase()
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
                const isSelected = selected === opt;
                let cls = "";

                if (submitted && resultData) {
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
                        name={`q_${q._id}`}
                        value={opt}
                        checked={isSelected}
                        disabled={submitted}
                        onChange={() =>
                          handleSelect(q._id, opt)
                        }
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

            {submitted && resultData?.explanation && (
              <div className="challengeQues-explaination">
                <h3>Explanation:</h3>
                <div>
                  <ReactMarkdown>
                    {resultData.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AllMode;
