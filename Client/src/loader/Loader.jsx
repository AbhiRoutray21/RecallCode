import "./Loader.css";
import Spinner from "./spinner";

export function PracticeSkeleton() {
  return (
    <div className="practice-skeleton-main">
    <div className="practice-skeleton">
      {Array.from({ length: 9 }).map((_, i) => (
        <div className="practice-skeleton-card" key={i}>
          <div className="practice-skeleton-logo shimmer"></div>
        </div>
      ))}
    </div>
    </div>
  );
}

export function SelectiveSkeleton() {
  return (
    <div className="selective-skeleton-main">
    <div className="selective-skeleton">
      {Array.from({ length: 2 }).map((_, i) => (
        <div className="selective-skeleton-card" key={i}>
          <div className="selective-skeleton-logo shimmer"></div>
        </div>
      ))}
    </div>
    </div>
  );
}

export function QuestionsPage() {
  return (
    <div className="questionsPage-skeleton-main">
      <div className="questionsPage-skeleton-header shimmer"/>
      <div className="questionsPage-skeleton-lang shimmer"/>
    </div>
  );
}

export function Pageloader() {
  return (
    <div className="PageLoader">
      <span><Spinner size="40px" dots="5px" speed="2s"/></span>
    </div>
  );
}

export function Blurloader() {
  return (
    <div className="Blurloader">
      <span><Spinner size="40px" dots="5px" speed="2s"/></span>
    </div>
  );
}