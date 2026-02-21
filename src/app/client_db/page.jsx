"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ClientDashBoard() {
  const [name, setName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return; // not logged in

      setUserId(user.id);

      // Ensure profile exists (minimal profile)
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // create minimal profile
        await supabase.from("profiles").upsert({
          id: user.id,
          role: "client",
        });
        setShowNamePopup(true);
      } else if (!profile.name) {
        setShowNamePopup(true);
      } else {
        setName(profile.name);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveName = async () => {
    if (!name.trim()) return;

    await supabase.from("profiles").upsert(
      { id: userId, name },
      { onConflict: "id" }
    );

    setShowNamePopup(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Mar's Auto Repair Shop</h1>
      {name && <p>Hello, {name}!</p>}

      {/* Dashboard buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
        <Link href="/request_service">
          <button style={btnStyle}>Request Service</button>
        </Link>
        <Link href="/talk_to_us">
          <button style={btnStyle}>Talk to Us</button>
        </Link>
        <Link href="/ratings">
          <button style={btnStyle}>Ratings</button>
        </Link>
      </div>

      {/* Name popup */}
      {showNamePopup && (
        <div style={modalStyles.backdrop}>
          <div style={modalStyles.modal}>
            <h2>Enter Your Name</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={modalStyles.input}
            />
            <button onClick={handleSaveName} style={modalStyles.button}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard button style
const btnStyle = {
  padding: "0.75rem",
  borderRadius: "5px",
  border: "none",
  background: "#0070f3",
  color: "white",
  cursor: "pointer",
};

// Modal styles
const modalStyles = {
  backdrop: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "2rem",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "300px",
  },
  input: { padding: "0.5rem", border: "1px solid #ccc", borderRadius: "5px" },
  button: {
    padding: "0.5rem",
    border: "none",
    borderRadius: "5px",
    background: "#0070f3",
    color: "white",
    cursor: "pointer",
  },
};