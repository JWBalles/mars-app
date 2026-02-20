"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (!session?.user) {
            setError("No user session found.");
            return;
          }

          const userId = session.user.id;

          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Profile fetch error:", profileError.message);
            setError("Unable to fetch user profile.");
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
        });
      } catch (err) {
        console.error(err);
        setError("Something went wrong during OAuth redirect.");
      }
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