"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  if (!isLoading) return null;

  return (
    <div style={styles.container}>
      <div style={styles.spinnerContainer}>
        {/* Outer spinner - Orange */}
        <div style={styles.outerSpinner}>
          <div style={styles.outerSpinnerInner} />
        </div>

        {/* Inner spinner - Blue */}
        <div style={styles.innerSpinner}>
          <div style={styles.innerSpinnerInner} />
        </div>
      </div>

      <style>{`
        @keyframes spinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinCounterClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  spinnerContainer: {
    position: "relative" as const,
    width: "60px",
    height: "60px",
  },
  outerSpinner: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "4px solid transparent",
    borderTopColor: "#FF5E00",
    borderRadius: "50%",
    animation: "spinClockwise 1s linear infinite",
  },
  outerSpinnerInner: {
    position: "absolute" as const,
    top: "4px",
    left: "4px",
    right: "4px",
    bottom: "4px",
    border: "4px solid transparent",
    borderBottomColor: "#FF5E00",
    borderRadius: "50%",
    animation: "spinCounterClockwise 1.5s linear infinite",
  },
  innerSpinner: {
    position: "absolute" as const,
    top: "10px",
    left: "10px",
    width: "calc(100% - 20px)",
    height: "calc(100% - 20px)",
    border: "4px solid transparent",
    borderTopColor: "#00205B",
    borderRadius: "50%",
    animation: "spinCounterClockwise 1.2s linear infinite",
  },
  innerSpinnerInner: {
    position: "absolute" as const,
    top: "4px",
    left: "4px",
    right: "4px",
    bottom: "4px",
    border: "4px solid transparent",
    borderBottomColor: "#00205B",
    borderRadius: "50%",
    animation: "spinClockwise 0.8s linear infinite",
  },
};
