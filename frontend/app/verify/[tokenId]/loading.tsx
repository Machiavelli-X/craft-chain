export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        backgroundColor: "#e5e7eb",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid #d1d5db",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            margin: "0 auto 20px",
            border: "5px solid #d1d5db",
            borderTop: "5px solid #111827",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        <h1
          style={{
            fontSize: "28px",
            marginBottom: "10px",
          }}
        >
          Verifying Product
        </h1>

        <p
          style={{
            color: "#4b5563",
            fontSize: "16px",
          }}
        >
          Checking the craft batch information...
        </p>

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </main>
  );
}