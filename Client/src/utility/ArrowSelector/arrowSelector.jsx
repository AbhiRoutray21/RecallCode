// ArrowSelector.jsx
// - Controlled component only
// - Works with strings or numbers
// - Loop navigation supported

import "./arrowSelector.css";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import { IoIosArrowForward,IoIosArrowBack } from "react-icons/io";

export default function ArrowSelector({
  values = [],
  value,
  onChange,
  loop = false,
  format = (v) => String(v),
  disabled = false,
  className = "",
}) {
  if (!values.length) return null;

  const currentIndex = values.findIndex((v) => v === value);
  const currentValue = values[currentIndex] ?? values[0];

  const changeIndex = (delta) => {
    if (disabled || !values.length) return;

    let newIndex = currentIndex + delta;
    const len = values.length;

    if (loop) {
      newIndex = ((newIndex % len) + len) % len; // wrap around
    } else {
      newIndex = Math.max(0, Math.min(len - 1, newIndex));
    }

    if (onChange) onChange(values[newIndex], newIndex);
  };

  return (
    <div className={`arrow-selector ${className}`}>
      <button
        type="button"
        className={`arrow-btn ${disabled ? "disabled" : ""}`}
        onClick={() => changeIndex(-1)}
        disabled={disabled}
      >
        <IoIosArrowBack className="icon" />
      </button>

      <div className="value-display">
        {format(currentValue)}
      </div>

      <button
        type="button"
        className={`arrow-btn ${disabled ? "disabled" : ""}`}
        onClick={() => changeIndex(+1)}
        disabled={disabled}
      >
        <IoIosArrowForward className="icon" />
      </button>
    </div>
  );
}
