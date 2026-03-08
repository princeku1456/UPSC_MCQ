const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html><html><body><table><tbody id="tbody"></tbody></table></body></html>`);
const document = dom.window.document;

const snapshot = [];
for (let i = 0; i < 5000; i++) {
    snapshot.push({
        data: () => ({
            timestamp: { toDate: () => new Date() },
            subject: 'Math',
            chapterName: 'Algebra',
            scorePercent: 85
        }),
        id: `doc_${i}`
    });
}

function baseline() {
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "N/A";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><small class="text-muted">${date}</small></td>
            <td><span class="fw-bold">${data.subject}</span></td>
            <td>${data.chapterName}</td>
            <td><span class="badge bg-primary">${data.scorePercent}%</span></td>
            <td class="text-end">
                <button class="btn btn-outline-danger btn-sm" onclick="deleteAttempt('${doc.id}', '${data.chapterName}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function optimized() {
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : "N/A";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><small class="text-muted">${date}</small></td>
            <td><span class="fw-bold">${data.subject}</span></td>
            <td>${data.chapterName}</td>
            <td><span class="badge bg-primary">${data.scorePercent}%</span></td>
            <td class="text-end">
                <button class="btn btn-outline-danger btn-sm" onclick="deleteAttempt('${doc.id}', '${data.chapterName}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
}

// Warmup
for (let i = 0; i < 2; i++) {
    baseline();
    optimized();
}

let iters = 5;

let start = performance.now();
for(let i=0; i<iters; i++) baseline();
let t1 = performance.now() - start;

start = performance.now();
for(let i=0; i<iters; i++) optimized();
let t2 = performance.now() - start;

console.log(`Baseline (appendChild in loop): ${t1.toFixed(2)}ms`);
console.log(`Optimized (DocumentFragment): ${t2.toFixed(2)}ms`);
console.log(`Improvement: ${((t1 - t2) / t1 * 100).toFixed(2)}%`);
