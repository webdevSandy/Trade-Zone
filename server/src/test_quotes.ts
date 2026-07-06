import dotenv from "dotenv";
dotenv.config();

import { fetchMarketQuotes } from "./services/upstoxService";
import { initAppConfigTable } from "./lib/neonDb";
import { loadTokenFromDb } from "./services/upstoxService";

async function run() {
  await initAppConfigTable();
  await loadTokenFromDb();
  console.log("Fetching quotes...");
  try {
    const res = await fetchMarketQuotes();
    console.log("Quotes count:", res.length);
    if (res.length > 0) {
      console.log("First quote:", JSON.stringify(res[0], null, 2));
    }
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
  process.exit(0);
}
run();
