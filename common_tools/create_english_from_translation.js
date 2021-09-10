const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

const inputFilePath = args[0];
const outputDir = args[1];

var translObj = JSON.parse(fs.readFileSync(inputFilePath).toString());


translObj.forEach(bit =>{
    bit.text = bit.SourceText;
})


const outputFilePath = path.join(outputDir, "eng_eng.json");
const jsonOut = JSON.stringify(translObj, null, 2);
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