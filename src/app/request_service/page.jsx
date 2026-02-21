"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RequestService() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  const [vehicleType, setVehicleType] = useState("");
  const [issue, setIssue] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [location, setLocation] = useState("");
  const [pickup, setPickup] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Batanes municipalities
  const municipalities = ["Basco", "Itbayat", "Mahatao", "Sabtang", "Uyugan"];

  // Barangays per municipality
  const barangaysByMunicipality = {
    Basco: ["Kaychanarian", "San Antonio", "Centro Norte"],
    Itbayat: ["Maysanga", "Chavayan", "Ibabao"],
    Mahatao: ["San Vicente", "Siyang"],
    Sabtang: ["Savidug", "Chavayan"],
    Uyugan: ["Kayuganan", "Poblacion"]
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        // Prefill location from user metadata if available
        setLocation(data.session.user?.user_metadata?.address || "");
      }
    };
    getSession();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("service-images")
      .upload(fileName, file);

    if (error) {
      setError("Failed to upload image: " + error.message);
      return null;
    }

    const { publicUrl } = supabase.storage
      .from("service-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!vehicleType || !issue || !municipality || !barangay || !location) {
      setError("Please fill in all required fields.");
      return;
    }

    // Upload image
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await handleImageUpload(imageFile);
      if (!imageUrl) return;
    }

    const { data, error } = await supabase.from("service_requests").insert([
      {
        user_id: session?.user.id || null,
        vehicle_type: vehicleType,
        issue,
        municipality,
        barangay,
        location,
        pickup,
        image_url: imageUrl,
        status: "pending",
      }
    ]);

    if (error) setError("Failed to submit request: " + error.message);
    else {
      setSuccess("Service request submitted successfully!");
      // Reset form
      setVehicleType("");
      setIssue("");
      setMunicipality("");
      setBarangay("");
      setLocation("");
      setPickup(false);
      setImageFile(null);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", padding: "10px" }}>
      <h1>Request Service</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Vehicle Type */}
        <label>Vehicle Type*</label>
        <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
          <option value="">Select vehicle type</option>
          <option value="Car">Car</option>
          <option value="Motorcycle">Motorcycle</option>
          <option value="Van/Truck">Van/Truck</option>
          <option value="Other">Other</option>
        </select>

        {/* Issue Description */}
        <label>Issue Description*</label>
        <textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          rows="4"
          placeholder="Describe the issue..."
        />

        {/* Municipality */}
        <label>Municipality*</label>
        <select
          value={municipality}
          onChange={(e) => {
            setMunicipality(e.target.value);
            setBarangay(""); // reset barangay
          }}
        >
          <option value="">Select municipality</option>
          {municipalities.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Barangay (required) */}
        {municipality && (
          <div>
            <label>Barangay*</label>
            <select value={barangay} onChange={(e) => setBarangay(e.target.value)}>
              <option value="">Select barangay</option>
              {(barangaysByMunicipality[municipality] || []).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}

        {/* Location */}
        <label>Location / Address*</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your address or nearest landmark"
        />

        {/* Pickup (only Batan Island municipalities) */}
        {(municipality === "Basco" || municipality === "Mahatao" || municipality === "Ivana" || municipality === "Uyugan") && (
          <label>
            <input
              type="checkbox"
              checked={pickup}
              onChange={(e) => setPickup(e.target.checked)}
            />
            Pickup required? (Additional charges may apply)
          </label>
        )}

        {/* Image Upload */}
        <label>Attach Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}