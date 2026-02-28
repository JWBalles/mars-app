import { Black_And_White_Picture } from "next/font/google";

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#1e293b",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },

  primaryButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },

  socialContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  socialButton: {
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    fontWeight: "500",
  },

  divider: {
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
  },

  error: {
    color: "red",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default styles;