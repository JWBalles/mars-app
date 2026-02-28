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

    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    if (!user) return;

    // ✅ Ensure profile exists and set role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        role: "client", // auto-set role to client
      });
      router.push("/client_db");
      return;
    }

    // ✅ Redirect based on role
    if (profile.role === "admin") router.push("/owner_db");
    else router.push("/client_db");
  };

  // 🔹 Google OAuth login
  const handleGoogleLogin = async () => {
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (googleError) setError(googleError.message);
  };

  // 🔹 Facebook OAuth login
  const handleFacebookLogin = async () => {
    const { error: fbError } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (fbError) setError(fbError.message);
  };

  return (
  <div style={styles.container}>
    <div style={styles.card}>
      <h2 style={styles.title}>Auto Repair Shop Login</h2>

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

        <button type="submit" style={styles.primaryButton}>
          Sign In
        </button>
      </form>

      <div style={styles.divider}>OR</div>

      <div style={styles.socialContainer}>
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