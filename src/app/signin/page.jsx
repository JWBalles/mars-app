"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./styles";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  ///////////////////////////////////////////////////////
  // 🔹 Check auth state changes (for OAuth and email login)
  ///////////////////////////////////////////////////////
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) return;

        const userId = session.user.id;

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError.message);
          setError("Failed to fetch user profile.");
          return;
        }

        // Create profile if missing
        if (!profile) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: userId,
            role: "client",
          });

          if (insertError) {
            console.error("Profile creation error:", insertError.message);
            setError("Unable to create user profile.");
            return;
          }

          router.push("/client_db");
          return;
        }

        // Redirect based on role
        if (profile.role === "owner") router.push("/owner_db");
        else router.push("/client_db");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  ///////////////////////////////////////////////////////
  // 🔹 Email login
  ///////////////////////////////////////////////////////
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) setError(loginError.message);
  };

  ///////////////////////////////////////////////////////
  // 🔹 Google OAuth login
  ///////////////////////////////////////////////////////
  const handleGoogleLogin = async () => {
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (googleError) setError(googleError.message);
  };

  ///////////////////////////////////////////////////////
  // 🔹 Facebook OAuth login
  ///////////////////////////////////////////////////////
  const handleFacebookLogin = async () => {
    const { error: fbError } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (fbError) setError(fbError.message);
  };

  ///////////////////////////////////////////////////////
  // 🔹 UI
  ///////////////////////////////////////////////////////
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