import "./ProgressRing.css";
import { CircularProgressAnimation } from "../../../utility/CircleProgressRing";

export default function ProgressRingAmination() {

  return (
    <div className="ProgressRing-container" >
      <div >Set Your Daily Goal</div>
      <p>Track your progress in each language</p>
      <div className="range-container" >
        <CircularProgressAnimation value={100} size={230} strokeWidth={20} color="#3b82f6" track = "var(--progressRing-color)"/>
      </div>
    </div>
  );
}
