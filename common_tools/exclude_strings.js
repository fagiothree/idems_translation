const fs = require('fs');
const path = require('path');

// removes the bits that do not need to be translated (specified in a list)
// from the translation file

const args = process.argv.slice(2);

const inputFilePath = args[0];
const bitsToExcludePath = args[1]
const outputFilePath = args[2];

var translObj = JSON.parse(fs.readFileSync(inputFilePath).toString());
const bitsToExcludeObj = JSON.parse(fs.readFileSync(bitsToExcludePath).toString());

var bitsToExclude = [];
bitsToExcludeObj.forEach(bit => {bitsToExclude.push(bit.SourceText)})

var filteredTransl = translObj.filter(bit =>(!bitsToExclude.includes(bit.SourceText)  ))

console.log(bitsToExclude.length)
console.log(translObj.length)
console.log(filteredTransl.length)

//const outputFilePath = path.join(outputDir, "filtered.json");
const jsonOut = JSON.stringify(filteredTransl, null, 2);
fs.writeFile(
    outputFilePath,
    jsonOut,
    outputFileErrorHandler
);


function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}