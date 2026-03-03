#!/bin/bash
total=0
runs=5
for i in $(seq 1 $runs); do
  output=$(node bench3.js | grep "Render time for chapters:")
  val=$(echo $output | grep -o "[0-9.]\+" | head -1)
  echo "Run $i: $val ms"
done
