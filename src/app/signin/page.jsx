"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./styles";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔹 Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) setError(loginError.message);
    else router.push("/client_db"); // go to dashboard after login
  };

  // 🔹 Google OAuth login
  const handleGoogleLogin = async () => {
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/client_db` },
    });
    if (googleError) setError(googleError.message);
  };

  // 🔹 Facebook OAuth login
  const handleFacebookLogin = async () => {
    const { error: fbError } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/client_db` },
    });
    if (fbError) setError(fbError.message);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Auto Repair Shop Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleEmailLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: "15px" }}>
          <button onClick={handleGoogleLogin} style={styles.socialButton}>
            Continue with Google
          </button>
          <button onClick={handleFacebookLogin} style={styles.socialButton}>
            Continue with Facebook
          </button>
        </div>
      </div>
    </div>
  );
}