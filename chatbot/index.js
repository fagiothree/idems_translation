const fs = require('fs');
const path = require('path');
const excel = require('excel4node');
const cleaner = require('./insert/check_has_any_word_args.js')
const integrity = require('./insert/check_integrity.js')
const fixer = require('./insert/fix_arg_qr_translation.js')
const ex = require('./extract/extract.js');
const insert = require('./insert/create-localization.js');
const modifyqr = require('./insert/modify_quick_replies.js');

const COMMANDS = {
    has_any_words_check,
    overall_integrity_check,
    fix_arg_qr_translation,
    extract,
    extract_simple,
    localize,
    move_quick_replies,
    reformat_quick_replies
};
const args = process.argv.slice(2);
const command = args.shift();

if (COMMANDS[command]) {
    COMMANDS[command](args);
} else {
    console.log(`Command not recognised, command=${command}`);
}

function has_any_words_check([inputFile, outputDir, FileOutputName, LogOutputName]) { 
    const obj = readInputFile(inputFile);   
    const [newobj, fixlog] = cleaner.fix_has_any_words(obj);
    // Export modified JSON file and the fixlog file
    writeOutputFile(outputDir, FileOutputName + ".json", newobj);
    writeOutputFile(outputDir, LogOutputName + ".txt", "JSON Processed: " + inputFile + '\n\n' +fixlog); 
}

function overall_integrity_check([inputFile, outputDir, LogOutputName, ExcelLogName]) { 
    const obj = readInputFile(inputFile);   
    const [debug, debug_lang, languages, ExcelLog] = integrity.check_integrity(obj, ExcelLogName);
    // Export modified JSON file and the fixlog file
    writeOutputFile(outputDir, LogOutputName + "_Original.txt", "JSON Processed: " + inputFile + '\n\n' + debug);
    log_to_excel(ExcelLog, ExcelLogName)
    for (const lang of languages){
        writeOutputFile(outputDir, LogOutputName + "_" + lang + ".txt", "JSON Processed: " + inputFile + '\n\n' + debug_lang[lang]);
    } 
}

function fix_arg_qr_translation([inputFile, outputDir, FileOutputName, LogOutputName]) { 
    const obj = readInputFile(inputFile);   
    const [newobj, debug_lang, languages] = fixer.fix_arg_qr_translation(obj);
    // Export modified JSON file and the fixlog file
    for (const lang of languages){
        writeOutputFile(outputDir, LogOutputName + "_" + lang + ".txt", "JSON Processed: " + inputFile + '\n\n' + debug_lang[lang]);
    }
    writeOutputFile(outputDir,FileOutputName + ".json", newobj); 
}

function extract([inputFile, outputDir]) {
    const obj = readInputFile(inputFile);
    //obj = reorderFlowsAlphabeticallyByName(obj);
    const bits = ex.extractTextForTranslation(obj);
    const fileForTransl = ex.createFileForTranslators(bits);
    const fileForTranslNoRep = ex.removeRepetitions(fileForTransl)[0]
          .map(ex.transformToTranslationFormat);

    writeOutputFile(outputDir, 'step_1.json', bits);
    writeOutputFile(outputDir, 'step_2.json', fileForTransl);
    writeOutputFile(outputDir, 'step_3.json', fileForTranslNoRep);
}

function extract_simple([inputFile, outputDir, outputname]) {
    const obj = readInputFile(inputFile);
    //obj = reorderFlowsAlphabeticallyByName(obj);
    const bits = ex.extractTextForTranslation(obj);
    const fileForTransl = ex.createFileForTranslators(bits);
    const fileForTranslNoRep = ex.removeRepetitions(fileForTransl)[0]
          .map(ex.transformToTranslationFormat);

    writeOutputFile(outputDir, outputname + ".json", fileForTranslNoRep);
}

function localize([inputFlow, translations, lang, outputName, outputDir]) {
    const [missing, partiallyTranslated, flows] = insert.createLocalization(
        readInputFile(inputFlow),
        readInputFile(translations),
        lang
    );

    writeOutputFile(outputDir, 'missing_' + lang + '.json', missing);
    writeOutputFile(outputDir, 'partially_transl_' + lang + '.json', partiallyTranslated);
    writeOutputFile(outputDir, outputName + '.json', flows);
}


function move_quick_replies([input_file, select_phrases, outputName, outputDir, add_selectors, qr_limit = 100, special_words = false]) {

    if(special_words != false){
        special_words = readInputFile(special_words)
    }

    const [flows, debug, debug_lang] = modifyqr.move_quick_replies_to_message_text(
        readInputFile(input_file),readInputFile(select_phrases), add_selectors, Number(qr_limit), special_words
    );
    writeOutputFile(outputDir, outputName + '.json', flows);
    writeOutputFile(outputDir, 'debug_qr.txt', debug);
    for (lang in debug_lang){
        writeOutputFile(outputDir, 'debug_qr_' + lang +'.txt', debug_lang[lang]);
    }
}

function reformat_quick_replies([input_file, select_phrases, outputName, outputDir, count_threshold = 1, length_threshold = 1, qr_limit = 100, special_words = false]) {

    if(special_words != false){
        special_words = readInputFile(special_words)
    }

    const [flows, debug, debug_lang] = modifyqr.reformat_quick_replies(readInputFile(input_file), readInputFile(select_phrases), Number(count_threshold), Number(length_threshold), Number(qr_limit), special_words)
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

function log_to_excel(arr, outputpath){
    // Create a new instance of a Workbook class
    var workbook = new excel.Workbook();

    // Add a worksheets to the workbook
    var worksheet = workbook.addWorksheet('QR_Arg_Warning_Log');


    // Create the headers at the top of the page
    worksheet.cell(1,1).string('QR_ID').style({font: {size: 10, bold: true}})
    worksheet.cell(1,2).string('Raw Quick Replies').style({font: {size: 10, bold: true}})
    worksheet.cell(1,3).string('Raw Arguments').style({font: {size: 10, bold: true}})
    worksheet.cell(1,4).string('Raw Arg Types').style({font: {size: 10, bold: true}})
    worksheet.cell(1,5).string('Processed Quick Replies').style({font: {size: 10, bold: true}})
    worksheet.cell(1,6).string('Processed Arguments').style({font: {size: 10, bold: true}})
    worksheet.cell(1,7).string('Processed Arg Types').style({font: {size: 10, bold: true}})
    worksheet.cell(1,8).string('Linker Matrix').style({font: {size: 10, bold: true}})
    worksheet.cell(1,9).string('Node Acceptable?').style({font: {size: 10, bold: true}})

    // Transfer our error data into the excel sheet
    let rowref = 2
    for (const row of arr){
        colref = 1
        for (const item of row){
            
            worksheet.cell(rowref,colref).string(item).style({font: {size: 12}}).style({alignment: {wrapText: true, vertical: 'top'}})
            
            
            colref++
        }
        rowref++
    }

    worksheet.column(1).setWidth(40)
    worksheet.column(2).setWidth(0)
    worksheet.column(3).setWidth(0)
    worksheet.column(4).setWidth(0)
    worksheet.column(5).setWidth(30)
    worksheet.column(6).setWidth(30)
    worksheet.column(7).setWidth(20)
    worksheet.column(8).setWidth(10)
    worksheet.column(9).setWidth(10)

     
    workbook.write(outputpath);

}
