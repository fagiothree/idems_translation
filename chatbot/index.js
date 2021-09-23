const fs = require('fs');
const path = require('path');
const ex = require('./extract/extract.js');
const insert = require('./insert/create-localization.js');
const { move_quick_replies_to_message_text } = require('./insert/add_quick_replies_to_msg_text_and_localization.js');

const COMMANDS = {
    extract,
    localize,
    move_quick_replies
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

function localize([inputFlow, translations, lang, outputName, outputDir]) {
    const [missing, flows] = insert.createLocalization(
        readInputFile(inputFlow),
        readInputFile(translations),
        lang
    );

    writeOutputFile(outputDir, 'missing.json', missing);
    writeOutputFile(outputDir, outputName + '.json', flows);
}

function move_quick_replies([input_file, outputName, outputDir]) {
    const [flows, debug] = move_quick_replies_to_message_text(
        readInputFile(input_file)
    );
    writeOutputFile(outputDir, outputName + '.json', flows);
    writeOutputFile(outputDir, 'debug.txt', debug);
}

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

function writeOutputFile(outputDir, filename, data) {
    const outputFile = path.join(outputDir, filename);
    let content = '';
    if (path.extname(outputFile) === '.json') {
        content = JSON.stringify(data, null, 2);
    } else {
        content = data;
    }
    fs.writeFile(
        outputFile,
        content,
        outputFileErrorHandler
    );
}

function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}
