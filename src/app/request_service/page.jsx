"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RequestServicePage() {
  const router = useRouter();

  const [session, setSession] = useState(null);

  const [vehicleType, setVehicleType] = useState("");
  const [issue, setIssue] = useState("");
  const [serviceType, setServiceType] = useState("");

  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [location, setLocation] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");

  // -----------------------------
  // DATA
  // -----------------------------
  const municipalities = ["Basco","Itbayat","Mahatao","Sabtang","Uyugan","Ivana"];
  const barangaysByMunicipality = {
    Basco: ["Kaychanarian","San Antonio","Kayhuvokan","San Joaquin","Chanarian","Tukon","Kayvaluganan"],
    Itbayat: ["Santa Lucia","Santa Rosa","San Rafael","Santa Maria","San Jose"],
    Mahatao: ["Uvoy","Panatayan","Kaumbakan","Hanib"],
    Sabtang: ["Savidug","Chavayan","Sinakan","Malakdang","Sumnanga"],
    Uyugan: ["Kayuganan","Itbud","Imnajbu"],
    Ivana: ["San Vicente","Radiwan","Tuhel","Salagao"]
  };

  // -----------------------------
  // SESSION (LOGIN REQUIRED)
  // -----------------------------
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/signin");
      } else {
        setSession(data.session);
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        router.push("/signin");
      } else {
        setSession(newSession);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // -----------------------------
  // RULES
  // -----------------------------
  const pickupSupportedAreas = ["Basco","Mahatao","Ivana","Uyugan"];
  const needsAddress = serviceType === "Pickup" || serviceType === "Home Service";
  const showHomeService = vehicleType === "Car" || vehicleType === "Van/Truck";

  // -----------------------------
  // WARNINGS
  // -----------------------------
  useEffect(() => {
    setWarning("");
    if (serviceType === "Pickup" && municipality && !pickupSupportedAreas.includes(municipality)) {
      setWarning("Pickup is not available in this municipality.");
    }
  }, [serviceType, municipality]);

  // -----------------------------
  // IMAGE UPLOAD
  // -----------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `service_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("service_images")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    // ✅ Corrected: getPublicUrl now returns data.publicUrl
    const { data, error: urlError } = supabase.storage
      .from("service_images")
      .getPublicUrl(filePath);

    if (urlError) throw new Error(urlError.message);
    return data.publicUrl;
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!session || !session.user?.id) {
      setError("You must be logged in to submit a request.");
      router.push("/signin");
      return;
    }

    if (!vehicleType || !issue || !serviceType) {
      setError("Please complete all required fields.");
      return;
    }

    if (needsAddress && (!municipality || !barangay || !location)) {
      setError("Complete address is required for this service type.");
      return;
    }

    let imageUrl = null;
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (err) {
        setError(`Image upload failed: ${err.message}`);
        return;
      }
    }

    const { error } = await supabase.from("service_requests").insert([{
      user_id: session.user.id,
      vehicle_type: vehicleType,
      issue,
      service_type: serviceType,
      municipality: needsAddress ? municipality : "N/A",
      barangay: needsAddress ? barangay : "N/A",
      location: needsAddress ? location : "N/A",
      image_url: imageUrl,
      status: "Pending",
      paid: false
    }]);

    if (error) setError(error.message);
    else {
      setSuccess("Service request submitted successfully.");
      setVehicleType(""); setIssue(""); setServiceType("");
      setMunicipality(""); setBarangay(""); setLocation("");
      setImageFile(null); setImagePreview("");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ maxWidth: "500px", margin: "30px auto" }}>
      <h1>Request Service</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {warning && <p style={{ color: "orange" }}>{warning}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label>Vehicle Type *</label>
        <select value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); setServiceType(""); }}>
          <option value="">Select vehicle</option>
          <option value="Car">Car</option>
          <option value="Motorcycle">Motorcycle</option>
          <option value="Van/Truck">Van/Truck</option>
          <option value="Other">Other</option>
        </select>

        <label>Issue Description *</label>
        <textarea rows="4" value={issue} onChange={(e) => setIssue(e.target.value)} />

        <label>Service Type *</label>
        <select value={serviceType} onChange={(e) => { setServiceType(e.target.value); setMunicipality(""); setBarangay(""); setLocation(""); }}>
          <option value="">Select service type</option>
          <option value="Walk-in">Walk-in</option>
          <option value="Pickup">Pickup</option>
          {showHomeService && <option value="Home Service">Home Service</option>}
        </select>

        {needsAddress && (
          <>
            <label>Municipality *</label>
            <select value={municipality} onChange={(e) => { setMunicipality(e.target.value); setBarangay(""); }}>
              <option value="">Select municipality</option>
              {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {municipality && (
              <>
                <label>Barangay *</label>
                <select value={barangay} onChange={(e) => setBarangay(e.target.value)}>
                  <option value="">Select barangay</option>
                  {(barangaysByMunicipality[municipality] || []).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </>
            )}

            <label>Detailed Address *</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Street / Landmark" />
          </>
        )}

        <label>Upload Supporting Image(optional)</label>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e)} />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: "120px", marginTop: "8px", borderRadius: "4px" }} />}

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}