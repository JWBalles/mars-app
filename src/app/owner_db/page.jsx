"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OwnerDashBoard() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    router.push("/signin"); // Redirect to login page after logout
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h1 className="title">Mar's Auto Repair Shop</h1>
        <div className="grid">

          <Link href="/pending_repairs">
            <button className="btn">Pending Repairs</button>
          </Link>

          <Link href="/customers">
            <button className="btn">Customers</button>
          </Link>

          <Link href="/vehicle_repair_status_list">
            <button className="btn">Vehicle Repair Status List</button>
          </Link>

          <Link href="/ratings">
            <button className="btn">Ratings</button>
          </Link>
          <Link href="/logout">
            <button className="btn" style={{ marginTop: "20px", backgroundColor: "#dc3545" }}>Logout</button>
          </Link>
        </div>

        

      </div>
    </div>
  );
}