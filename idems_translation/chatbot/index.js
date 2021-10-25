const fs = require('fs');
const path = require('path');
const cleaner = require('./insert/check_has_any_word_args.js')
const ex = require('./extract/extract.js');
const insert = require('./insert/create-localization.js');
const { move_quick_replies_to_message_text } = require('./insert/add_quick_replies_to_msg_text_and_localization.js');

const COMMANDS = {
    has_any_words_check,
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

function has_any_words_check(inputFile){
    const obj = readInputFile(inputFile);
    const [outputobject, fixlog] = cleaner.fix_has_any_words(obj)

    // Export modified JSON file and the fixlog file
    fs.writeFile("C:/Users/edmun/Code/TestFiles/plswork.json", outputobject, outputFileErrorHandler)
    fs.writeFile("C:/Users/edmun/Code/TestFiles/plswork.txt", fixlog, outputFileErrorHandler)

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

    writeOutputFile(outputDir, 'missing_' + lang + '.json', missing);
    writeOutputFile(outputDir, outputName + '.json', flows);
}


function move_quick_replies([input_file, select_phrases, outputName, outputDir]) {
    const [flows, debug, debug_lang] = move_quick_replies_to_message_text(
        readInputFile(input_file),readInputFile(select_phrases)
    );
    writeOutputFile(outputDir, outputName + '.json', flows);
    writeOutputFile(outputDir, 'debug_qr.txt', debug);
    for (lang in debug_lang){
        writeOutputFile(outputDir, 'debug_qr_' + lang +'.txt', debug_lang[lang]);
    }
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
