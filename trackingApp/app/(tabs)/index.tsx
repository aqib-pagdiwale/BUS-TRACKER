import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

const SERVER = "http://10.1.19.99:5000";
const DEVICE_ID = "POS_DEMO_001";

export default function Index() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= SEND GPS ================= */

  const sendLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      await fetch(`${SERVER}/update-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat,
          lng,
          deviceId: DEVICE_ID,
        }),
      });

      console.log("📍 Sent GPS:", lat, lng);
    } catch (e) {
      console.log("GPS send error:", e);
    }
  };

  /* ================= FETCH UI DATA ================= */

  const fetchData = async () => {
    try {
      const res = await fetch(`${SERVER}/pos-ui/${DEVICE_ID}`);
      const json = await res.json();
      console.log("📡 API DATA:", json);

      setData(json);
      setLoading(false);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();

      // first run immediately
      sendLocation();
      fetchData();
    })();

    // GPS every 15 sec
    const gpsTimer = setInterval(sendLocation, 15000);

    // UI refresh every 5 sec
    const fetchTimer = setInterval(fetchData, 5000);

    return () => {
      clearInterval(gpsTimer);
      clearInterval(fetchTimer);
    };
  }, []);

  /* ================= UI ================= */

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>Loading POS Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BUS LIVE DATA</Text>

      <Text style={styles.text}>Bus: {data.busNumber}</Text>
      <Text style={styles.text}>Latitude: {data.lat}</Text>
      <Text style={styles.text}>Longitude: {data.lng}</Text>
      <Text style={styles.text}>Time: {data.time}</Text>
      <Text style={styles.text}>Device: {data.deviceId}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "black",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: "white",
  },
});
