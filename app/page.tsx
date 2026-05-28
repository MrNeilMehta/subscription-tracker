"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Subscription = {
  id: string;
  name: string;
  price: string;
  date: string;
  cycle: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [cycle, setCycle] = useState("");

  // -------------------------
  // AUTH CHECK (FIXED)
  // -------------------------
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, []);

  // -------------------------
  // FETCH SUBSCRIPTIONS
  // -------------------------
  const fetchSubscriptions = async () => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id) // 🔥 IMPORTANT FILTER
    .order("created_at", { ascending: false });

  if (!error && data) {
    setSubscriptions(data);
  } else {
    console.log("Fetch error:", error);
  }
};

  // -------------------------
  // ADD SUBSCRIPTION
  // -------------------------
  const addSubscription = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    alert("Not logged in");
    return;
  }

  const { error } = await supabase.from("subscriptions").insert([
    {
      name,
      price,
      date,
      cycle,
      user_id: user.id,
      user_email: user.email, // 🔥 KEY FIX
      
    },
  ]);

  if (!error) {
    setName("");
    setPrice("");
    setDate("");
    setCycle("");
    fetchSubscriptions();
  } else {
    console.log("Insert error:", error);
  }
};

  // -------------------------
  // DAYS LEFT LOGIC
  // -------------------------
  const getDaysLeft = (dateString: string) => {
    const today = new Date();
    const renewalDate = new Date(dateString);

    today.setHours(0, 0, 0, 0);
    renewalDate.setHours(0, 0, 0, 0);

    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (days: number) => {
    if (days <= 2) return "urgent";
    if (days <= 7) return "warning";
    return "safe";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>
        Subscription Tracker
      </h1>

      <p style={{ color: "#aaa", marginBottom: "30px" }}>
        Welcome {user?.email}
      </p>

      {/* FORM */}
      <form onSubmit={addSubscription} style={{ marginBottom: "40px" }}>
        <input
          placeholder="Subscription name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />

        <select
          value={cycle}
          onChange={(e) => setCycle(e.target.value)}
          style={inputStyle}
        >
          <option value="">Billing cycle</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button style={buttonStyle}>Add Subscription</button>
      </form>

      {/* LIST */}
      <div>
        {subscriptions.map((sub) => {
          const daysLeft = getDaysLeft(sub.date);
          const status = getStatus(daysLeft);

          return (
            <div key={sub.id} style={cardStyle}>
              <h3>{sub.name}</h3>

              <p>${sub.price}</p>

              <p>Renews: {sub.date}</p>

              <p
                style={{
                  fontWeight: "bold",
                  color:
                    status === "urgent"
                      ? "red"
                      : status === "warning"
                      ? "orange"
                      : "lightgreen",
                }}
              >
                {daysLeft} days left ({status})
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}

// -------------------------
// STYLES
// -------------------------
const inputStyle = {
  display: "block",
  width: "300px",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #333",
  backgroundColor: "#111",
  color: "white",
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "white",
  color: "black",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const cardStyle = {
  border: "1px solid #333",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "10px",
  width: "300px",
};