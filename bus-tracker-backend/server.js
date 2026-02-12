const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= Mongo ================= */

mongoose.connect(
  "mongodb+srv://aaquibpagdiwale1133_db_user:Aqib@bustracker.sdqqbof.mongodb.net/bustracker",
);

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected");
});

/* ================= Models ================= */

const Bus = require("./models/Bus");
const PosMachine = require("./models/PosMachine");
const BusPos = require("./models/BusPos");

/* ================= Location ================= */

const locationSchema = new mongoose.Schema({
  deviceId: String,
  busNumber: String,
  lat: Number,
  lng: Number,
  readableTime: String,
  time: { type: Date, default: Date.now },
});

const Location = mongoose.model("Location", locationSchema);

/* ================= Time Helper ================= */

function getReadableTime() {
  return new Date().toLocaleString("en-GB", { hour12: false });
}

/* ================= POST Update Location ================= */

app.post("/update-location", async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);

    const { deviceId, lat, lng } = req.body;
    if (!deviceId || !lat || !lng) {
      return res.status(400).json({ error: "Missing fields" });
    }

    /* ---------- POS ---------- */
    let pos = await PosMachine.findOne({ deviceId });

    if (!pos) {
      pos = await PosMachine.create({
        deviceId,
        name: "Auto POS",
      });
      console.log("🆕 POS created");
    }

    /* ---------- BUS ---------- */
    let bus = await Bus.findOne({ busNumber: "Bus 101" });

    if (!bus) {
      bus = await Bus.create({
        busNumber: "Bus 101",
        route: "Demo Route",
      });
      console.log("🆕 Bus created");
    }

    /* ---------- LINK ---------- */
    let link = await BusPos.findOne({ posMachine: pos._id });

    if (!link) {
      link = await BusPos.create({
        bus: bus._id,
        posMachine: pos._id,
      });
      console.log("🔗 Bus ↔ POS linked");
    }

    const busNumber = bus.busNumber;

    /* ---------- SAVE LOCATION ---------- */

    await Location.create({
      deviceId,
      busNumber,
      lat,
      lng,
      readableTime: getReadableTime(),
    });

    console.log("📍 Saved:", deviceId, busNumber, lat, lng);

    res.json({ success: true, busNumber });
  } catch (err) {
    console.log("🔥 ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= GET POS UI ================= */

app.get("/pos-ui/:deviceId", async (req, res) => {
  const latest = await Location.findOne({
    deviceId: req.params.deviceId,
  }).sort({ time: -1 });

  if (!latest) return res.json({ message: "No data" });

  res.json({
    deviceId: latest.deviceId,
    busNumber: latest.busNumber,
    lat: latest.lat,
    lng: latest.lng,
    time: latest.readableTime,
  });
});

/* ================= DEMO SEED ================= */

app.get("/seed-demo", async (req, res) => {
  await Location.create({
    deviceId: "POS_DEMO_001",
    busNumber: "Bus 101",
    lat: 17.712,
    lng: 75.856,
    readableTime: getReadableTime(),
  });

  res.send("Seeded demo data");
});

/* ================= START ================= */

app.listen(5000, () => {
  console.log("🚍 Server running on 5000");
});
