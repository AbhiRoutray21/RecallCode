import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

export const CircularProgressAnimation = ({
  value = 75,  
  size = 100,
  strokeWidth = 10,
  color = "#4ade80",
  track = "#2a2a2a",
  duration = 1.2,
}) => {
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;

  const svgRef = useRef(null);
  const inView = useInView(svgRef, { once: true, amount: 0.35 });

  // Motion value for % (0 → value)
  const mv = useMotionValue(0);
  // Convert % to strokeDashoffset
  const dashoffset = useTransform(mv, (v) => C - (v / 100) * C);

  // Display number in the center
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    const unsub = mv.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, value, duration, mv]);

  return (
    <svg ref={svgRef} width={size} height={size}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={track}
        strokeWidth={strokeWidth}
      />

      {/* Animated ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={C}
        style={{
          strokeDashoffset: dashoffset,
          rotate: -90,            // start at top
          transformOrigin: "50% 50%",
        }}
      />

      {/* Center text */}
      <text
        x="50%"
        y="50%"
        dy=".32em"
        textAnchor="middle"
        fontWeight="700"
        fontSize={Math.max(12, size * 0.22)}
        fill="var(--text-color)"
      >
        {display}%
      </text>
    </svg>
  );
};


