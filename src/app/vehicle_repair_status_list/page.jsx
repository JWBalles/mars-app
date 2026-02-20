"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RepairStatusList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  // Fetch repair requests with related foreign keys
  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase
      .from("service_requests")
      .select(`
        id,
        vehicle_type_id (name),
        issue_id (description),
        location,
        pickup,
        status,
        image_url,
        paid,
        created_at
      `);

    if (search) {
      query = query.or(
        `vehicle_type_id.name.ilike.%${search}%,issue_id.description.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    query = query.order(sortBy, { ascending: false });

    const { data, error } = await query;
    if (error) console.error(error.message);
    else setRequests(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [search, sortBy]);

  // Toggle paid status
  const togglePaid = async (id, currentPaid) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ paid: !currentPaid }) // just toggle boolean
      .eq("id", id);

    if (error) console.error(error.message);
    else fetchRequests(); // refresh list
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "10px" }}>
      <h1>Vehicle Repair Status List</h1>

      {/* Search & Sort */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search by vehicle, issue, or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">Sort by Date</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No repair requests found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle Type</th>
              <th>Issue</th>
              <th>Location</th>
              <th>Pickup</th>
              <th>Status</th>
              <th>Image</th>
              <th>Paid</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{req.id}</td>
                <td>{req.vehicle_type_id?.name || "N/A"}</td>
                <td>{req.issue_id?.description || "N/A"}</td>
                <td>{req.location}</td>
                <td>{req.pickup ? "Yes" : "No"}</td>
                <td>{req.status}</td>
                <td>
                  {req.image_url ? (
                    <a href={req.image_url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "No Image"
                  )}
                </td>
                {/* Paid toggle button */}
                <td>
                  <button
                    style={{
                      backgroundColor: req.paid ? "green" : "red",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => togglePaid(req.id, req.paid)}
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