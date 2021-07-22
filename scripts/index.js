const fs = require('fs');
const path = require('path');
const ex = require('./extract/extract.js');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'extract') {
    const inputFile = args[1];
    const outputDir = args[2];
    extract(inputFile, outputDir);
} else {
    console.log(`Command not recognised, command=${command}`);
}

function extract(inputFile, outputDir) {
    const jsonString = fs.readFileSync(inputFile).toString();
    const obj = JSON.parse(jsonString);

    //obj = reorderFlowsAlphabeticallyByName(obj);
    const bits = ex.extractTextForTranslation(obj);
    const fileForTransl = ex.createFileForTranslators(bits);
    const fileForTranslNoRep = ex.removeRepetitions(fileForTransl)
          .map(ex.transformToTranslationFormat);

    writeOutputFile(outputDir, "step_1.json", bits);
    writeOutputFile(outputDir, "step_2.json", fileForTransl);
    writeOutputFile(outputDir, "step_3.json", fileForTranslNoRep);
}

function writeOutputFile(outputDir, filename, data) {
    const outputFile = path.join(outputDir, filename);
    const json = JSON.stringify(data, null, 2);
    fs.writeFile(
        outputFile,
        json,
        outputFileErrorHandler
    );
}

function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}
