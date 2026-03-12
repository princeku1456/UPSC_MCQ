const { performance } = require('perf_hooks');

// Generate mock data
const numEntries = 10000;
const filteredSortedData = Array.from({ length: numEntries }, (_, i) => ({
  userEmail: `user${i}@example.com`,
  scorePercent: Math.floor(Math.random() * 100)
}));
const currentUser = { email: `user9999@example.com` };

function concatApproach() {
  let rows = "";
  let rank = 1;
  filteredSortedData.forEach((entry) => {
    const email = entry.userEmail || "Guest";
    const rawName = email.split("@")[0];
    const displayName =
      rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
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
                        ${
                          isMe
                            ? '<span class="badge bg-warning text-dark dummy-tag ms-2" style="font-size:0.6rem">YOU</span>'
                            : ""
                        }
                    </div>
                </td>
                <td class="text-end pe-3">
                    <span class="badge ${
                      entry.scorePercent >= 80 ? "bg-success" : "bg-primary"
                    }">${entry.scorePercent}%</span>
                </td>
            </tr>
        `;
  });
  return rows;
}

function arrayPushJoinApproach() {
  const rowsArray = [];
  let rank = 1;
  filteredSortedData.forEach((entry) => {
    const email = entry.userEmail || "Guest";
    const rawName = email.split("@")[0];
    const displayName =
      rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
    const isMe = currentUser && entry.userEmail === currentUser.email;

    rowsArray.push(`
            <tr class="${isMe ? "table-warning fw-bold" : ""}">
                <td class="ps-3 text-secondary">#${rank++}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style="width:24px; height:24px; font-size:10px;">
                            ${rawName.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-dark">${displayName}</span>
                        ${
                          isMe
                            ? '<span class="badge bg-warning text-dark dummy-tag ms-2" style="font-size:0.6rem">YOU</span>'
                            : ""
                        }
                    </div>
                </td>
                <td class="text-end pe-3">
                    <span class="badge ${
                      entry.scorePercent >= 80 ? "bg-success" : "bg-primary"
                    }">${entry.scorePercent}%</span>
                </td>
            </tr>
        `);
  });
  return rowsArray.join('');
}

// Warmup
for (let i = 0; i < 100; i++) {
  concatApproach();
  arrayPushJoinApproach();
}

const ITERATIONS = 100;

const startConcat = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  concatApproach();
}
const endConcat = performance.now();
console.log(`String concatenation: ${(endConcat - startConcat).toFixed(2)} ms for ${ITERATIONS} iterations`);

const startArray = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  arrayPushJoinApproach();
}
const endArray = performance.now();
console.log(`Array push + join: ${(endArray - startArray).toFixed(2)} ms for ${ITERATIONS} iterations`);
