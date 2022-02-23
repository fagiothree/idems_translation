const fs = require('fs');
const path = require('path');

// removes the bits that do not need to be translated (specified in a list)
// from the translation file

const args = process.argv.slice(2);

const inputFilePath1 = args[0];
const inputFilePath2 = args[1]
const outputFilePath = args[2];

var translList1 = JSON.parse(fs.readFileSync(inputFilePath1).toString());
var translList2 = JSON.parse(fs.readFileSync(inputFilePath2).toString());
var concatenatedList = translList1.concat(translList2);

const jsonOut = JSON.stringify(concatenatedList, null, 2);
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