const Benchmark = require('benchmark');

const suite = new Benchmark.Suite;

// Mock data
const allScores = Array.from({length: 10000}, () => Math.random() * 100);
const percentage = "50.0";

suite.add('Filter + Length', function() {
  const betterThan = allScores.filter(
    (s) => s < parseFloat(percentage)
  ).length;
})
.add('For Loop Count', function() {
  let betterThan = 0;
  const pct = parseFloat(percentage);
  for (let i = 0; i < allScores.length; i++) {
    if (allScores[i] < pct) {
      betterThan++;
    }
  }
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': false });
