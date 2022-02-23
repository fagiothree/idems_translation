const fs = require('fs');
const path = require('path');



const args = process.argv.slice(2);

const engJsonFilePath = args[0];
const translDictPath = args[1]
const outputDir = args[2];

var translDict = JSON.parse(fs.readFileSync(translDictPath).toString());
const engBits = JSON.parse(fs.readFileSync(engJsonFilePath).toString());

var translBits = [];
var duplicates = [];
var missing = [];

engBits.forEach(bit => {
    let matches = translDict.filter( tr => (tr.SourceText.trim().toLowerCase() == bit.SourceText.trim().toLowerCase() && tr.type == bit.type));
    if (matches.length > 0){
        translBits.push(matches[0])
        if (matches.length > 1){
            duplicates.push(matches)
        }
    } else {
        missing.push(bit);
    }
})


const missingOutputFilePath = path.join(outputDir, "missing.json");
const missJsonOut = JSON.stringify(missing, null, 2);
fs.writeFile(
    missingOutputFilePath,
    missJsonOut,
    outputFileErrorHandler
);

const translOutputFilePath = path.join(outputDir, "translated.json");
const translJsonOut = JSON.stringify(translBits, null, 2);
fs.writeFile(
    translOutputFilePath,
    translJsonOut,
    outputFileErrorHandler
);

const duplOutputFilePath = path.join(outputDir, "duplicates.json");
const duplJsonOut = JSON.stringify(duplicates, null, 2);

fs.writeFile(
    duplOutputFilePath,
    duplJsonOut,
    outputFileErrorHandler
);


function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}