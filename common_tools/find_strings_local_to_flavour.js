const fs = require('fs');
const path = require('path');

// finds the strings that are only in a localised version of the flows (not in the international)
// more in general finds all the strings of flavourPath that are not in internationalFilePath

const args = process.argv.slice(2);

const internationalFilePath = args[0];
const flavourPath = args[1]
const outputFilePath = args[2];

const interObj = JSON.parse(fs.readFileSync(internationalFilePath).toString());
const flavourObj = JSON.parse(fs.readFileSync(flavourPath).toString());

var localBits = [];

flavourObj.forEach(bit =>{
    let matches = interObj.filter( tr => (tr.SourceText.trim().toLowerCase() == bit.SourceText.trim().toLowerCase() && tr.type == bit.type));
    if (matches.length == 0){
        localBits.push(bit)
    }
})


console.log(flavourObj.length)
console.log(localBits.length)


const jsonOut = JSON.stringify(localBits, null, 2);
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