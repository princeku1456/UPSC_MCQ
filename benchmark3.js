const { performance } = require('perf_hooks');

// Generate mock data
const numEntries = 100000; // Increased to 100k
const filteredSortedData = Array.from({ length: numEntries }, (_, i) => ({
  userEmail: `user${i}@example.com`,
  scorePercent: Math.floor(Math.random() * 100)
}));
const currentUser = { email: `user9999@example.com` };

function concatApproach() {
  let rows = "";
  let rank = 1;
  for (let i = 0; i < filteredSortedData.length; i++) {
    const entry = filteredSortedData[i];
    const email = entry.userEmail || "Guest";
    const rawName = email.split("@")[0];
    const displayName = rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
    const isMe = currentUser && entry.userEmail === currentUser.email;

    rows += `
            <tr class="${isMe ? "table-warning fw-bold" : ""}">
                <td class="ps-3 text-secondary">#${rank++}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style="width:24px; height:24px; font-size:10px;">
                            ${rawName.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-dark">${displayName}</span>
                        ${isMe ? '<span class="badge bg-warning text-dark dummy-tag ms-2" style="font-size:0.6rem">YOU</span>' : ""}
                    </div>
                </td>
                <td class="text-end pe-3">
                    <span class="badge ${entry.scorePercent >= 80 ? "bg-success" : "bg-primary"}">${entry.scorePercent}%</span>
                </td>
            </tr>
        `;
  }
  return rows;
}

function arrayMapJoinApproach() {
  const rows = filteredSortedData.map((entry, index) => {
    const email = entry.userEmail || "Guest";
    const rawName = email.split("@")[0];
    const displayName = rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
    const isMe = currentUser && entry.userEmail === currentUser.email;
    const rank = index + 1;

    return `
            <tr class="${isMe ? "table-warning fw-bold" : ""}">
                <td class="ps-3 text-secondary">#${rank}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style="width:24px; height:24px; font-size:10px;">
                            ${rawName.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-dark">${displayName}</span>
                        ${isMe ? '<span class="badge bg-warning text-dark dummy-tag ms-2" style="font-size:0.6rem">YOU</span>' : ""}
                    </div>
                </td>
                <td class="text-end pe-3">
                    <span class="badge ${entry.scorePercent >= 80 ? "bg-success" : "bg-primary"}">${entry.scorePercent}%</span>
                </td>
            </tr>
        `;
  }).join('');
  return rows;
}

// Warmup
for (let i = 0; i < 10; i++) {
  concatApproach();
  arrayMapJoinApproach();
}

const ITERATIONS = 10;

const startConcat = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  concatApproach();
}
const endConcat = performance.now();
console.log(`String concatenation: ${(endConcat - startConcat).toFixed(2)} ms for ${ITERATIONS} iterations`);

const startArray = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  arrayMapJoinApproach();
}
const endArray = performance.now();
console.log(`Array map + join: ${(endArray - startArray).toFixed(2)} ms for ${ITERATIONS} iterations`);
