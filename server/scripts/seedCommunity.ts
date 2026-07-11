import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
// import dns from 'dns';
import CommunityPost from '../src/models/CommunityPost';
import User from '../src/models/User';

// dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedCommunity = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not found");
    
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    // Clear old gibberish posts
    await CommunityPost.deleteMany({});
    console.log("Cleared old community posts.");

    // Create some realistic posts
    const posts = [
      {
        title: "Having trouble connecting ESP32 to the college WiFi network",
        content: "Hi everyone, I'm trying to connect my ESP32 to the eduroam network on campus, but it fails to get an IP address and just prints errors in the Serial Monitor. Has anyone encountered this and knows how to configure a WPA2 Enterprise connection in the Arduino IDE?",
        tags: ["ESP32", "WiFi", "Networking"],
        upvotes: [],
        replies: [
          {
            content: "The eduroam network blocks standard IoT connections due to its encryption protocols. You should use a mobile hotspot or register for the dedicated lab network if they have one.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            content: "There's a special ESP32 library called `esp_wpa2.h` that allows you to pass a username and password for enterprise networks. Look it up on Google or GitHub.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          }
        ]
      },
      {
        title: "How to prevent Raspberry Pi from overheating?",
        content: "Our project relies on image processing running on a Raspberry Pi 4, and it operates continuously for several hours. I noticed the CPU temperature reaches 80°C. Is passive cooling enough or do I strictly need an active fan?",
        tags: ["Raspberry Pi", "Hardware", "Computer Vision"],
        upvotes: [],
        replies: [
          {
            content: "The Raspberry Pi 4 tends to run very hot under sustained load (especially when using OpenCV). Passive cooling won't cut it here. Buy a simple 5V fan and connect it to the GPIO pins.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          }
        ]
      },
      {
        title: "Best protocol for low power battery operated sensors?",
        content: "We are building an environmental monitoring system running on AA batteries. Should we use MQTT over WiFi, BLE, or LoRa? We need it to last at least 6 months.",
        tags: ["Power Management", "Protocols", "LoRa", "BLE"],
        upvotes: [],
        replies: [
          {
            content: "WiFi will drain your batteries in days. If the range is short (under 10 meters), use BLE. If you need long range (kilometers), LoRa is the standard choice for this.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          },
          {
            content: "Don't forget to put your microcontroller into Deep Sleep mode between readings! The protocol matters, but deep sleep is critical for battery life.",
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          }
        ]
      },
      {
        title: "Is the default college MQTT broker down?",
        content: "I'm trying to send commands to the broker and I don't see anything appearing in the Device Playground. Is anyone else experiencing issues?",
        tags: ["MQTT", "Server", "Debugging"],
        upvotes: [],
        replies: []
      }
    ];

    await CommunityPost.insertMany(posts);
    console.log("Inserted realistic community posts!");
    
    mongoose.connection.close();
    console.log("Done.");
  } catch (error) {
    console.error("Error seeding:", error);
    mongoose.connection.close();
  }
};

seedCommunity();
