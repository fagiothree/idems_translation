const fs = require('fs');
const path = require('path');
const ex = require('./extract/extract.js');
const insert = require('./insert/create-localization.js');

const COMMANDS = {
    extract,
    localize
};
const args = process.argv.slice(2);
const command = args.shift();

if (COMMANDS[command]) {
    COMMANDS[command](args);
} else {
    console.log(`Command not recognised, command=${command}`);
}

function extract([inputFile, outputDir]) {
    const obj = readInputFile(inputFile);
    //obj = reorderFlowsAlphabeticallyByName(obj);
    const bits = ex.extractTextForTranslation(obj);
    const fileForTransl = ex.createFileForTranslators(bits);
    const fileForTranslNoRep = ex.removeRepetitions(fileForTransl)
          .map(ex.transformToTranslationFormat);

    writeOutputFile(outputDir, 'step_1.json', bits);
    writeOutputFile(outputDir, 'step_2.json', fileForTransl);
    writeOutputFile(outputDir, 'step_3.json', fileForTranslNoRep);
}

function localize([inputFlow, translations, lang, outputDir]) {
    const [missing, flows] = insert.createLocalization(
        readInputFile(inputFlow),
        readInputFile(translations),
        lang
    );

    writeOutputFile(outputDir, 'missing.json', missing);
    writeOutputFile(outputDir, 'flows.json', flows);
}

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
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
