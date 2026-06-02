const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BASE = "https://api.mail.tm";

// ✅ নতুন random email তৈরি করো
app.post("/api/create", async (req, res) => {
  try {
    // ১. Available domain নাও
    const { data: domainData } = await axios.get(`${BASE}/domains`);
    const domain = domainData["hydra:member"][0].domain;

    // ২. Random username বানাও
    const user = Math.random().toString(36).substring(2, 10);
    const address = `${user}@${domain}`;
    const password = Math.random().toString(36).substring(2, 14);

    // ৩. Account তৈরি করো
    await axios.post(`${BASE}/accounts`, { address, password });

    // ৪. Token নাও
    const { data: tokenData } = await axios.post(`${BASE}/token`, {
      address,
      password,
    });

    res.json({
      email: address,
      password,
      token: tokenData.token,
      id: tokenData.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Inbox দেখো
app.get("/api/messages", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const { data } = await axios.get(`${BASE}/messages`, {
      headers: { Authorization: token },
    });
    res.json(data["hydra:member"]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ একটা নির্দিষ্ট mail পড়ো
app.get("/api/messages/:id", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const { data } = await axios.get(`${BASE}/messages/${req.params.id}`, {
      headers: { Authorization: token },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Account delete করো
app.delete("/api/account/:id", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    await axios.delete(`${BASE}/accounts/${req.params.id}`, {
      headers: { Authorization: token },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
