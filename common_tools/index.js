const fs = require('fs');
const path = require('path');
const findMissing = require('./find_missing_bits_to_translate.js');
const inventory = require('./make_inventory.js');


const COMMANDS = {
    missing,
    match,
    add_restored
};
const args = process.argv.slice(2);
const command = args.shift();

if (COMMANDS[command]) {
    COMMANDS[command](args);
} else {
    console.log(`Command not recognised, command=${command}`);
}

function missing([inputFile_current_list, inputFile_translation_dict, outputDir]) {
    const curr_list = readInputFile(inputFile_current_list);
    const curr_transl = readInputFile(inputFile_translation_dict);
    
    const missing_bits = findMissing.findMissing(curr_list,curr_transl);
    writeOutputFile(outputDir, 'missing_bits_to_translate.json', missing_bits);
}

function match([inputFile_missing_bits, inputFile_translation_dict, outputDir]) {
    const missing_bits = readInputFile(inputFile_missing_bits);
    const curr_transl = readInputFile(inputFile_translation_dict);
    
    const best_matches = inventory.findBestMatch(missing_bits,curr_transl)
    writeOutputFile(outputDir, 'best_matches.json', best_matches);
}

function add_restored([inputFile_selected_best_matches, inputFile_translation_dict, outputDir]) {
    // ????if inputFile_translation_dict is not specified it should be the empty list?????
    const selected_best_matches = readInputFile(inputFile_selected_best_matches);
    const curr_transl = readInputFile(inputFile_translation_dict);
    
    const updated_transl_dict = inventory.addRestoredToTranslationDictionary(selected_best_matches,curr_transl)
    writeOutputFile(outputDir, 'update_transl_dict.json', updated_transl_dict);
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
