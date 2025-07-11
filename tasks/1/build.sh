#!/bin/bash

output="./dist/entry.js"
input_folder="./src"
jquery_chunk="./src/jquery.js"

rm -rf $output
mkdir -p "$(dirname "$output")" && touch $output

function trim() {
  cat $1 | tr -ds '\n''\t' [:blank:]
}

trim $jquery_chunk > $output

for file in $(find $input_folder -type f -name "*.js"); do
  if [ "$file" != "$jquery_chunk" ]; then
    trim $file >> $output
  fi
done
