const axios = require('axios');

// Usage: node scripts/simulate_iot_device.js [DEVICE_ID] [EMAIL] [PASSWORD] [DEVICE_TYPE]
// If 3 args (Token provided directly): node scripts/simulate_iot_device.js <TOKEN> <DEVICE_TYPE>
const ARG1 = process.argv[2];
const ARG2 = process.argv[3];
const ARG3 = process.argv[4];
const DEVICE_TYPE = process.argv[5] || "HVAC";

const API_BASE = "http://localhost:3000";

async function main() {
  let apiToken = ARG1;

  // If email/password provided, try to fetch token via login + device lookup
  // NOTE: This is a simulation script helper. In real IoT, the device usually has the token burned in.
  // Since our API doesn't expose "Get my Token" easily without login, we'll assume:
  // 1. If ARG1 looks like a UUID/Token (long string), use it.
  // 2. If ARG1 is a Device ID (short or uuid) and ARG2/ARG3 are credentials -> Fetch Token.
  
  if (ARG2 && ARG3) {
    console.log("Attempting to fetch API Token for device...");
    try {
      // 1. Login to get Session Cookie
      // Note: NextAuth credentials login is tricky via script without full browser flow due to CSRF/Cookies.
      // For this simulation script, we'll stick to the easier path:
      // USER MUST PROVIDE THE TOKEN COPIED FROM THE UI.
      console.log("Automatic token fetching via script is complex with NextAuth.");
      console.log("Please copy the API Token from the Device Details page in the Admin Dashboard.");
      process.exit(1);
    } catch (e) {
      console.error("Login failed", e.message);
      process.exit(1);
    }
  }

  if (!apiToken) {
    console.error("Error: Please provide an API Token.");
    console.log("Usage: node scripts/simulate_iot_device.js <API_TOKEN>");
    process.exit(1);
  }

  console.log(`Starting simulation with Token: ${apiToken.substring(0, 10)}...`);
  
  // ... rest of loop
  setInterval(() => sendData(apiToken), 5000);
  sendData(apiToken);
}

function generateConsumption() {
  const base = 1.5; // Default
  const variance = Math.random() * 0.5;
  return (base + variance).toFixed(3);
}

async function sendData(token) {
  try {
    const consumption = generateConsumption();
    const response = await axios.post(
      `${API_BASE}/api/iot/data`,
      { value: consumption, unit: "kWh" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`[${new Date().toISOString()}] Sent: ${consumption} kWh - Status: ${response.status}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) console.error(JSON.stringify(error.response.data));
  }
}

main();

