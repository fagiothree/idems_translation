const fs = require('fs');
const path = require('path');
const cleaner = require('./insert/check_has_any_word_args.js')
const integrity = require('./insert/check_integrity.js')
const fixer = require('./insert/fix_arg_qr_translation.js')
const ex = require('./extract/extract.js');
const insert = require('./insert/create-localization.js');
const { move_quick_replies_to_message_text } = require('./insert/add_quick_replies_to_msg_text_and_localization.js');

const COMMANDS = {
    has_any_words_check,
    overall_integrity_check,
    fix_arg_qr_translation,
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

function has_any_words_check([inputFile, outputDir]) { 
    const obj = readInputFile(inputFile);   
    const [newobj, fixlog] = cleaner.fix_has_any_words(obj);
    // Export modified JSON file and the fixlog file
    writeOutputFile(outputDir, path.parse(inputFile).name + "_mod.json", newobj);
    writeOutputFile(outputDir, path.parse(inputFile).name + "_mod.txt", "JSON Processed: " + inputFile + '\n\n' +fixlog); 
}

function overall_integrity_check([inputFile, outputDir]) { 
    const obj = readInputFile(inputFile);   
    const [debug, debug_lang, languages] = integrity.check_integrity(obj);
    // Export modified JSON file and the fixlog file
    writeOutputFile(outputDir, path.parse(inputFile).name + "_ENGIntegrity.txt", "JSON Processed: " + inputFile + '\n\n' + debug);
    for (const lang of languages){
        writeOutputFile(outputDir, path.parse(inputFile).name + "_" + lang + "Integrity.txt", "JSON Processed: " + inputFile + '\n\n' + debug_lang[lang]);
    } 
}

function fix_arg_qr_translation([inputFile, outputDir]) { 
    const obj = readInputFile(inputFile);   
    const [newobj, debug_lang, languages] = fixer.fix_arg_qr_translation(obj);
    // Export modified JSON file and the fixlog file
    for (const lang of languages){
        writeOutputFile(outputDir, path.parse(inputFile).name + "_" + lang + "_ArgAutoFixed.txt", "JSON Processed: " + inputFile + '\n\n' + debug_lang[lang]);
    }
    writeOutputFile(outputDir, path.parse(inputFile).name + "_ArgAutoFixed.json", newobj); 
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
