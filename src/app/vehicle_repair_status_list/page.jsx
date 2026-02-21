"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RepairStatusList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paidFilter, setPaidFilter] = useState("All");

  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase
      .from("service_requests")
      .select(`
        id,
        vehicle_type,
        issue,
        location,
        status,
        paid,
        created_at,
        municipality,
        barangay,
        profiles ( name )
      `)
      .order("created_at", { ascending: false });

    if (statusFilter !== "All") query = query.eq("status", statusFilter);
    if (paidFilter !== "All") query = query.eq("paid", paidFilter === "Paid");

    const { data, error } = await query;
    if (error) console.error(error.message);
    else setRequests(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, paidFilter]);

  const getNextStatus = (currentStatus) => {
    if (currentStatus === "Pending") return "Processing";
    if (currentStatus === "Processing") return "Finished";
    return currentStatus;
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "#ffc107";
    if (status === "Processing") return "#17a2b8";
    if (status === "Finished") return "#28a745";
    return "#6c757d";
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!currentStatus) currentStatus = "Pending";
    if (currentStatus === "Finished") return;

    const nextStatus = getNextStatus(currentStatus);

    if (nextStatus === "Finished") {
      const confirmFinish = window.confirm(
        "Are you sure you want to mark this as Finished?"
      );
      if (!confirmFinish) return;
    }

    const { error } = await supabase
      .from("service_requests")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) console.error(error.message);
    else
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: nextStatus } : req
        )
      );
  };

  const togglePaid = async (id, currentPaid) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ paid: !currentPaid })
      .eq("id", id);

    if (error) console.error(error.message);
    else
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, paid: !currentPaid } : req
        )
      );
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto" }}>
      <h1>Vehicle Repair Status List</h1>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
        <div>
          <label>Status: </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Finished</option>
          </select>
        </div>

        <div>
          <label>Payment: </label>
          <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
            <option>All</option>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Vehicle</th>
              <th>Issue / Description</th>
              <th>Location</th>
              <th>Municipality</th>
              <th>Barangay</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{req.id}</td>
                <td>{req.profiles?.name || "Unknown"}</td>
                <td>{req.vehicle_type || "Unknown"}</td>
                <td>{req.issue || "No description"}</td>
                <td>{req.location || "No location"}</td>
                <td>{req.municipality || "Unknown"}</td>
                <td>{req.barangay || "Unknown"}</td>

                {/* STATUS BUTTON */}
                <td>
                  <button
                    onClick={() => toggleStatus(req.id, req.status || "Pending")}
                    disabled={req.status === "Finished"}
                    style={{
                      backgroundColor: getStatusColor(req.status || "Pending"),
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: req.status === "Finished" ? "not-allowed" : "pointer",
                      opacity: req.status === "Finished" ? 0.7 : 1,
                      fontWeight: "bold",
                    }}
                  >
                    {req.status || "Pending"}
                  </button>
                </td>

                {/* PAID BUTTON */}
                <td>
                  <button
                    onClick={() => togglePaid(req.id, req.paid)}
                    style={{
                      backgroundColor: req.paid ? "#28a745" : "#dc3545",
                      color: "white",
                      padding: "6px 10px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    {req.paid ? "Paid" : "Unpaid"}
                  </button>
                </td>

                <td>{new Date(req.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}