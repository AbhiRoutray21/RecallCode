import "./ProgressBar.css";

const ProgressBar = ({ progress = 10,  color = '#5ad66fff' }) => {
  return (
    <div className="progress-container">
      <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor:`${color}`}}/>
    </div>
  );
};

export default ProgressBar;
