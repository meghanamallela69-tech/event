import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use Google and Cloudflare DNS for resolving MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Resolve SRV record manually using forced DNS servers
const resolveSrv = (hostname) => {
  return new Promise((resolve, reject) => {
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses);
    });
  });
};

export const dbConnection = async () => {
  const maxRetries = parseInt(process.env.DB_RETRY_ATTEMPTS) || 3;
  const retryDelay = parseInt(process.env.DB_RETRY_DELAY) || 5000;

  const ATLAS_USER = "meghana123";
  const ATLAS_PASS = "meghana1234";
  const ATLAS_CLUSTER = "cluster0.gfbrfcg.mongodb.net";
  const DB_NAME = "eventhub";

  // Common Mongoose options
  const commonOptions = {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4,
    bufferCommands: true,
    maxPoolSize: 10,
    retryWrites: true,
    w: "majority",
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔌 MongoDB Atlas connection attempt ${attempt}/${maxRetries}...`);

    // --- Method 1: Standard SRV URI (with forced DNS) ---
    try {
      const srvUri = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASS}@${ATLAS_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
      console.log("📡 Trying Atlas SRV URI (forced DNS: 8.8.8.8, 1.1.1.1)...");
      const connection = await mongoose.connect(srvUri, commonOptions);
      return onConnected(connection);
    } catch (err) {
      console.log(`❌ SRV method failed: ${err.message}`);
    }

    // --- Method 2: Resolve SRV manually, then build direct URI ---
    try {
      console.log("📡 Resolving SRV records manually via Google DNS...");
      const srvRecords = await resolveSrv(ATLAS_CLUSTER);
      const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(",");
      const directUri = `mongodb://${ATLAS_USER}:${ATLAS_PASS}@${hosts}/${DB_NAME}?ssl=true&authSource=admin&replicaSet=atlas-${ATLAS_CLUSTER.split(".")[0]}-shard-0&retryWrites=true&w=majority`;
      console.log(`📡 Trying resolved direct URI (${srvRecords.length} hosts found)...`);
      const connection = await mongoose.connect(directUri, commonOptions);
      return onConnected(connection);
    } catch (err) {
      console.log(`❌ Manual SRV resolve failed: ${err.message}`);
    }

    // --- Method 3: Well-known Atlas shard hostnames (resolved replica set name) ---
    try {
      const shardHosts = [
        "ac-qghgqgg-shard-00-00.gfbrfcg.mongodb.net:27017",
        "ac-qghgqgg-shard-00-01.gfbrfcg.mongodb.net:27017",
        "ac-qghgqgg-shard-00-02.gfbrfcg.mongodb.net:27017"
      ].join(",");
      const replicaUri = `mongodb://${ATLAS_USER}:${ATLAS_PASS}@${shardHosts}/${DB_NAME}?ssl=true&authSource=admin&replicaSet=atlas-qghgqgg-shard-0&retryWrites=true&w=majority`;
      console.log("📡 Trying Atlas direct shard hostnames (ac-qghgqgg)...");
      const connection = await mongoose.connect(replicaUri, commonOptions);
      return onConnected(connection);
    } catch (err) {
      console.log(`❌ Direct shard method failed: ${err.message}`);
    }

    if (attempt < maxRetries) {
      console.log(`⏳ Retrying in ${retryDelay / 1000}s...`);
      await sleep(retryDelay);
    }
  }

  // All attempts failed — do NOT fall back to local DB
  console.error("\n💥 All MongoDB Atlas connection attempts failed!");
  console.error("🔧 Checklist:");
  console.error("   1. Go to https://cloud.mongodb.com → Network Access → Add IP: 0.0.0.0/0 (allow all)");
  console.error("   2. Verify cluster is active (not paused)");
  console.error("   3. Confirm credentials: username=meghana123");
  console.error("   4. Run: nslookup cluster0.gfbrfcg.mongodb.net 8.8.8.8  (to test DNS)");
  process.exit(1);
};

function onConnected(connection) {
  console.log("\n🎉 Successfully connected to MongoDB Atlas!");
  console.log("✅ Database:", connection.connection.db.databaseName);
  console.log("✅ Host:", connection.connection.host);

  try {
    connection.connection.db.listCollections().toArray().then(cols => {
      console.log("📋 Collections:", cols.map(c => c.name).join(", ") || "(none yet)");
    });
  } catch (_) {}

  mongoose.connection.on("error", (err) => console.error("❌ DB error:", err.message));
  mongoose.connection.on("disconnected", () => console.log("⚠️ DB disconnected"));
  mongoose.connection.on("reconnected", () => console.log("🔄 DB reconnected"));

  return connection;
}