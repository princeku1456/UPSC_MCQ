const Benchmark = require('benchmark');

const allScores = Array.from({length: 10000}, () => Math.random() * 100);
const myScore = 50;

const suite = new Benchmark.Suite;

suite.add('filter.length', function() {
  const betterThan = allScores.filter((s) => s < myScore).length;
})
.add('reduce', function() {
  const betterThan = allScores.reduce((count, s) => s < myScore ? count + 1 : count, 0);
})
.add('for loop', function() {
  let betterThan = 0;
  for (let i = 0; i < allScores.length; i++) {
    if (allScores[i] < myScore) {
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
