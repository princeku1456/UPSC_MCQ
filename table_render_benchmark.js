const lines = [];
for(let i=0; i<50; i++) {
    lines.push(`Col1 | Col2 | Col3 | Col4 | Col5`);
}
const separator = '|';

function baseline() {
    let html = '<div class="table-responsive my-3"><table class="table table-bordered table-sm table-hover align-middle mb-0"><thead>';

    const headers = lines[0].split(separator);
    html += '<tr class="table-light">';
    headers.forEach(h => {
        html += `<th class="fw-bold text-secondary text-uppercase small" scope="col">${h.trim()}</th>`;
    });
    html += '</tr></thead><tbody>';

    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(separator);
        html += '<tr>';
        cells.forEach(c => {
            html += `<td>${c.trim()}</td>`;
        });
        html += '</tr>';
    }

    html += '</tbody></table></div>';
    return html;
}

function optimized() {
    let html = '<div class="table-responsive my-3"><table class="table table-bordered table-sm table-hover align-middle mb-0"><thead>';

    const headers = lines[0].split(separator);
    html += '<tr class="table-light">';
    html += headers.map(h => `<th class="fw-bold text-secondary text-uppercase small" scope="col">${h.trim()}</th>`).join('');
    html += '</tr></thead><tbody>';

    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(separator);
        html += `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
    }

    html += '</tbody></table></div>';
    return html;
}

// Warmup
for(let i=0; i<100; i++) { baseline(); optimized(); }

let iters = 100000;
let start = performance.now();
for(let i=0; i<iters; i++) baseline();
let t1 = performance.now() - start;

start = performance.now();
for(let i=0; i<iters; i++) optimized();
let t2 = performance.now() - start;

console.log(`Baseline (forEach): ${t1.toFixed(2)}ms`);
console.log(`Optimized (map + join): ${t2.toFixed(2)}ms`);
