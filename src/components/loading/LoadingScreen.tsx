"use client";

export default function LoadingScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>KAI Services</h1>
        <div style={styles.dotsContainer}>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .loading-title {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .loading-dots span {
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }
        .loading-dots span:nth-child(3) {
          animation-delay: 0s;
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
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  title: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "28px",
    fontWeight: 700,
    color: "#00205B",
    margin: 0,
    letterSpacing: "1px",
  },
  dotsContainer: {
    display: "flex",
    gap: "8px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#FF5E00",
  },
};
