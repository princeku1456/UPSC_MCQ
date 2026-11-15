const { performance } = require('perf_hooks');

function testDelete(keysCount) {
    const cache = {};
    for (let i = 0; i < keysCount; i++) {
        cache['key_' + i] = i;
    }
    const start = performance.now();
    for (let key in cache) delete cache[key];
    const end = performance.now();
    return end - start;
}

function testReassign(keysCount) {
    let cache = {};
    for (let i = 0; i < keysCount; i++) {
        cache['key_' + i] = i;
    }
    const start = performance.now();
    cache = {};
    const end = performance.now();
    return end - start;
}

const N = 100000;
console.log(`Deleting ${N} keys: ${testDelete(N).toFixed(4)} ms`);
console.log(`Reassigning object with ${N} keys: ${testReassign(N).toFixed(4)} ms`);
