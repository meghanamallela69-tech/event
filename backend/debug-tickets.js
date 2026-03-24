import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

const ATLAS_USER = "meghana123";
const ATLAS_PASS = "meghana1234";
const ATLAS_CLUSTER = "cluster0.gfbrfcg.mongodb.net";
const DB_NAME = "eventhub";
const srvUri = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASS}@${ATLAS_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

await mongoose.connect(srvUri, { serverSelectionTimeoutMS: 20000, socketTimeoutMS: 45000, family: 4 });

const events = await mongoose.connection.db.collection("events").find({ eventType: "ticketed" }).toArray();
console.log("Ticketed Events:");
events.forEach(e => {
  console.log("\nTitle:", e.title);
  console.log("Ticket Types:", JSON.stringify(e.ticketTypes, null, 2));
  console.log("Available Tickets:", e.availableTickets);
  console.log("Total Tickets:", e.totalTickets);
  console.log("---");
});

await mongoose.disconnect();
