import React from "react";
import "./Loading.css";

interface LoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  size = "medium",
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? "loading-container-fullscreen"
    : "loading-container";
  const spinnerClass = `loading-spinner loading-spinner-${size}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
