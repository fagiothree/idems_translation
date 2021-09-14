const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

const inputFilePath = args[0];
const outputDir = args[1];

var translObj = JSON.parse(fs.readFileSync(inputFilePath).toString());

var sameTransl = [];

translObj.forEach(bit => {
    if (bit.SourceText == bit.text){
        sameTransl.push(bit);
    }
});

const outputFilePath = path.join(outputDir, "same_transl.json");
const jsonOut = JSON.stringify(sameTransl, null, 2);
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