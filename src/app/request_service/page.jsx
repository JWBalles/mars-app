"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RequestService() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  const [vehicleType, setVehicleType] = useState("");
  const [issue, setIssue] = useState("");
  const [location, setLocation] = useState("");
  const [pickup, setPickup] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Get current logged-in session
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

  // Upload image to Supabase Storage
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

    if (!vehicleType || !issue || !location) {
      setError("Please fill in all required fields.");
      return;
    }

    // ------------------------------
    // FEATURE: Must be logged in first
    // Currently optional. Uncomment to enforce login.
    // if (!session) {
    //   setError("You must be logged in to request service.");
    //   return;
    // }
    // ------------------------------

    // Upload image if present
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await handleImageUpload(imageFile);
      if (!imageUrl) return;
    }

    const { data, error } = await supabase.from("service_requests").insert([
      {
        user_id: session?.user.id || null, // optional if login not enforced
        vehicle_type: vehicleType,
        issue,
        location,
        pickup,
        image_url: imageUrl,
        status: "pending",
      },
    ]);

    if (error) {
      setError("Failed to submit request: " + error.message);
    } else {
      setSuccess("Service request submitted successfully!");
      // Reset form
      setVehicleType("");
      setIssue("");
      setPickup(false);
      setImageFile(null);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", padding: "10px" }}>
      <h1>Request Service</h1>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

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

        {/* Location */}
        <label>Location*</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your address or nearest landmark"
        />

        {/* Pickup */}
        <label>
          <input
            type="checkbox"
            checked={pickup}
            onChange={(e) => setPickup(e.target.checked)}
          />
          Pickup required?
        </label>

        {/* Image Upload / Camera */}
        <label>Attach Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment" // opens camera on mobile
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}