"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const developerMessageRef = useRef<HTMLTextAreaElement>(null);
  const userMessageRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  const developerMessageDefault =
    "To every user question the response should be informative, but should be rendered as a brutalist poetry in the style of Mayakovsky, in English.";
  const userMessageDefault = "Tell me about Sam Paul, the genius";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setError("");
    setVisible(false);
    try {
      const payload = {
        developer_message: developerMessageRef.current?.value || "",
        user_message: userMessageRef.current?.value || "",
        model: modelRef.current?.value || undefined,
        api_key: apiKeyRef.current?.value || ""
      };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("API error: " + res.status);
      let result = "";
      if ((res as any).body?.getReader) {
        const reader = (res as any).body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setResponse(result);
        }
      } else {
        result = await res.text();
        setResponse(result);
      }
      setTimeout(() => setVisible(true), 100);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setVisible(true), 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: "Impact, Arial Black, Arial, sans-serif", background: "#e10600", minHeight: "100vh", padding: 0, margin: 0 }}>
      <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", background: "#fff", color: "#e10600", border: "8px solid #222", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", padding: "2.5rem 2rem", position: "relative" }}>
        <div style={{ marginBottom: "2rem" }}>
          <svg width="100%" height="120" viewBox="0 0 700 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="700" height="120" fill="#e10600" />
            <polygon points="0,120 700,0 700,120" fill="#fff" opacity="0.15" />
            <text x="50%" y="65" textAnchor="middle" fontSize="60" fontFamily="Impact, Arial Black, Arial, sans-serif" fill="#fff" stroke="#222" strokeWidth="3">REVOLUTION CHAT</text>
          </svg>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", border: "4px solid #222", background: "#fff", padding: "2rem", boxShadow: "0 4px 16px rgba(225,6,0,0.15)" }}>
          <label htmlFor="developerMessage" style={{ fontWeight: "bold", color: "#e10600", fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "1px" }}>Developer Message:</label>
          <textarea id="developerMessage" ref={developerMessageRef} rows={2} required defaultValue={developerMessageDefault} style={{ fontFamily: "Impact, Arial Black, Arial, sans-serif", fontSize: "1.1rem", padding: "0.75rem", border: "4px solid #222", background: "#fff", color: "#e10600" }} />

          <label htmlFor="userMessage" style={{ fontWeight: "bold", color: "#e10600", fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "1px" }}>User Message:</label>
          <textarea id="userMessage" ref={userMessageRef} rows={2} required defaultValue={userMessageDefault} style={{ fontFamily: "Impact, Arial Black, Arial, sans-serif", fontSize: "1.1rem", padding: "0.75rem", border: "4px solid #222", background: "#fff", color: "#e10600" }} />

          <label htmlFor="model" style={{ fontWeight: "bold", color: "#e10600", fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "1px" }}>Model (optional):</label>
          <input id="model" ref={modelRef} type="text" placeholder="gpt-4.1-mini (default)" style={{ fontFamily: "Impact, Arial Black, Arial, sans-serif", fontSize: "1.1rem", padding: "0.75rem", border: "4px solid #222", background: "#fff", color: "#e10600" }} />

          <label htmlFor="apiKey" style={{ fontWeight: "bold", color: "#e10600", fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "1px" }}>OpenAI API Key:</label>
          <input id="apiKey" ref={apiKeyRef} type="password" required autoComplete="off" style={{ fontFamily: "Impact, Arial Black, Arial, sans-serif", fontSize: "1.1rem", padding: "0.75rem", border: "4px solid #222", background: "#fff", color: "#e10600" }} />

          <button type="submit" disabled={loading} style={{ background: "#222", color: "#fff", border: "4px solid #e10600", padding: "1rem 2rem", fontSize: "1.3rem", fontFamily: "Impact, Arial Black, Arial, sans-serif", textTransform: "uppercase", letterSpacing: "2px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontWeight: "bold", display: "flex", alignItems: "center" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle", marginRight: 8 }}>
              <circle cx="16" cy="16" r="16" fill="#e10600" stroke="#222" strokeWidth="3" />
              <polygon points="10,8 26,16 10,24" fill="#fff" stroke="#222" strokeWidth="2" />
            </svg>
            {loading ? "Sending..." : "Send to API"}
          </button>
        </form>
        <section style={{ marginTop: "2.5rem", background: "#222", border: "6px solid #e10600", padding: "2rem", color: "#fff", boxShadow: "0 4px 16px rgba(225,6,0,0.15)" }}>
          <div style={{ marginBottom: "1rem" }}>
            <svg width="100%" height="60" viewBox="0 0 700 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="700" height="60" fill="#222" />
              <polygon points="0,60 700,0 700,60" fill="#e10600" opacity="0.2" />
              <text x="50%" y="40" textAnchor="middle" fontSize="32" fontFamily="Impact, Arial Black, Arial, sans-serif" fill="#fff" stroke="#e10600" strokeWidth="2">RESPONSE</text>
            </svg>
          </div>
          <pre style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.98)", transition: "opacity 0.7s cubic-bezier(.68,-0.55,.27,1.55), transform 0.7s cubic-bezier(.68,-0.55,.27,1.55)", whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#fff", fontSize: "1.2rem", fontFamily: "Courier New, Courier, monospace", background: "none", margin: 0 }}>
            {loading ? <span style={{ display: "inline-block" }}><svg className="spinner" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" stroke="#fff" strokeWidth="6" fill="none"/><circle cx="20" cy="20" r="16" stroke="#e10600" strokeWidth="6" fill="none" strokeDasharray="100" strokeDashoffset="60"><animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/></circle></svg></span> : error ? `Error: ${error}` : response}
          </pre>
        </section>
      </div>
    </main>
  );
}
