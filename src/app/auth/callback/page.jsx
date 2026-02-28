"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
  const handleOAuthRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("No user session found.");
      return;
    }

    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      setError("Unable to fetch user profile.");
      return;
    }

    // Create profile if missing
    if (!profile) {
      await supabase.from("profiles").insert({
        id: userId,
        role: "client",
      });

      router.replace("/client_db");
      return;
    }

    // 🔥 Redirect based on role (UPDATED)
    if (profile.role === "admin") router.replace("/owner_db");
    else router.replace("/client_db");
  };

  handleOAuthRedirect();
}, [router]);
  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Processing login...</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!error && <p>Please wait while we redirect you to your dashboard.</p>}
    </div>
  );
}