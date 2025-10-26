import { useMemo, useState } from "react";
import "./levelBar.css";

export default function LevelBar({
  min = 5,
  max = 20,
  step = 5,
  initial = 5,
  onChange,
}) {
  const [value, setValue] = useState(initial);

  const steps = useMemo(() => {
    const arr = [];
    for (let v = min; v <= max; v += step) arr.push(v);
    return arr;
  }, [min, max, step]);

  const percent = ((value - min) / (max - min)) * 100;

  const handleChange = (e) => {
    const v = Number(e.target.value);
    setValue(v);
    onChange?.(v);
  };

  return (
    <div className="levelbar">
      {/* value bubble */}
      {/* <div className="bubble" style={{ left: `calc(${percent}% )` }}>
        {value}
      </div> */}

      {/* ticks + labels (clickable) */}
      <div className="ticks">
        {steps.map((v) => {
          const p = ((v - min) / (max - min)) * 100;
          return (
            <button
              key={v}
              className={`tick ${v === value ? "active" : ""}`}
              style={{ left: `${p}%` }}
              onClick={() => {
                setValue(v);
                onChange?.(v);
              }}
              aria-label={`Set level to ${v}`}
            >
              <span className="label">{v}</span>
              {/* <span className="dot" /> */}
            </button>
          );
        })}
      </div>

      {/* range input */}
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label="Level selector"
        style={{
          // fill the track up to current value
          background: `linear-gradient(to right, var(--accent) ${percent}%, var(--track) ${percent}%)`,
        }}
      />


    </div>
  );
}
