const fs = require('fs');
const path = require('path');


function index(inputFile, outputDir) {
    const jsonString = fs.readFileSync(inputFile).toString();
    const obj = JSON.parse(jsonString);

    //obj = reorderFlowsAlphabeticallyByName(obj);
    const bits = extractTextForTranslation(obj);
    const fileForTransl = create_file_for_translators(bits);
    const fileForTranslNoRep = removeRepetitions(fileForTransl);

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

function reorderFlowsAlphabeticallyByName(obj) {
    obj.flows.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    });
    return obj;
}

function extractTextForTranslation(obj) {
    const CASE_TYPES_TO_TRANSLATE = [
        "has_any_word",
        "has_all_words",
        "has_phrase",
        "has_only_phrase",
        "has_beginning"
    ];

    let bitsToTranslate = {};
    let bitsLengths = [];

    obj.flows.forEach(flow => {
        let eng_localization = {};
        flow.nodes.forEach(node => {
            node.actions.forEach(action => {
                if (action.type === 'send_msg') {
                    eng_localization[action.uuid] = {
                        text: [action.text],
                        quick_replies: action.quick_replies
                    };
                    let char_count = action.quick_replies.reduce(
                        (acc, qr) => acc + qr.length,
                        action.text.length
                    );
                    if (action.quick_replies.length > 0){
                        char_count +=50;
                    }
                    bitsLengths.push(char_count);
                }
            });

            if (node.hasOwnProperty('router') && node.router.operand === '@input.text') {
                node.router.cases.forEach(c => {
                    if (CASE_TYPES_TO_TRANSLATE.includes(c.type)) {
                        eng_localization[c.uuid] = {
                            arguments: c.arguments
                        };
                    }
                });
            }
        });

        bitsToTranslate[flow.uuid] = {
            flowid: flow.uuid,
            name: flow.name,
            localization: {
                eng: eng_localization
            }
        };
    });

    var average = bitsLengths.reduce((a, b) => a + b, 0) / bitsLengths.length;
    console.log("average length " + average);
    console.log(bitsLengths);
    return bitsToTranslate;
}


///////////////// step 2
 function create_file_for_translators(obj) {

    var new_file = [];
    var word_count = 0;
    var char_count = 0;
    var count = 1;

    for (var fl in obj) {
        //if (obj[fl].name.startsWith("PLH - Supportive") || obj[fl].name.startsWith("PLH - Activity") || obj[fl].name.startsWith("PLH - Content")) {
        //if (!obj[fl].name.startsWith("PLH - Supportive")) {
        //if (!obj[fl].name.startsWith("PLH - Content")) {
        //if (!obj[fl].name.startsWith("PLH - Activity")) {
            
           // continue;
            //break

        //}
        //console.log(obj[fl].name)
        var localization = obj[fl].localization.eng;
        for (var key_bit in localization) {
            var bit = localization[key_bit];
            if (bit.hasOwnProperty('text')) {
                var lines = bit.text[0].split("\n");
                var atom_to_translate = {};
                atom_to_translate.has_extraline = 0;
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i] == "") {
                        atom_to_translate.has_extraline++;
                    }
                    else {
                        atom_to_translate.flow_id = fl;
                        atom_to_translate.flow_name = obj[fl].name;
                        atom_to_translate.bit_id = key_bit;
                        atom_to_translate.bit_type = "text";
                        atom_to_translate.type_id = i;
                        if (lines[i].startsWith("•\t")) {
                            atom_to_translate.text = lines[i].replace("•\t", "");
                            atom_to_translate.has_bullet = true;
                        }
                        else {
                            atom_to_translate.text = lines[i];
                        }
                        if (lines[i].indexOf("@") > -1) {
                            atom_to_translate.note = "Strings like @fields.xxx and @results.yyy should not be translated. ";
                            if (lines[i].indexOf("survey") > -1) {
                                atom_to_translate.note = atom_to_translate.note + "@fields.survey_behave_name is the name of the child";
                            }
                            if (lines[i].indexOf("count") > -1) {
                                atom_to_translate.note = atom_to_translate.note + "@results.count is a number (counter for list)";
                            }
                            if (lines[i].indexOf("skills") > -1) {
                                atom_to_translate.note = atom_to_translate.note + "@results.n_skills_week and results.n_skills are numbers";
                            }

                        }
                        atom_to_translate.word_count = word_count;
                        atom_to_translate.source_text = atom_to_translate.text;
                        new_file.push(Object.assign({}, atom_to_translate));
                        word_count = word_count + atom_to_translate.text.split(" ").length;
                        char_count = char_count + atom_to_translate.text.length;
                        atom_to_translate = {};
                        atom_to_translate.has_extraline = 0;
                    }
                }
            }
            if (bit.hasOwnProperty('quick_replies')) {
                for (var qr = 0; qr < bit.quick_replies.length; qr++) {
                    var atom_to_translate = {};
                    atom_to_translate.flow_id = fl;
                    atom_to_translate.flow_name = obj[fl].name;
                    atom_to_translate.bit_id = key_bit;
                    atom_to_translate.bit_type = "quick_replies";
                    atom_to_translate.type_id = qr;
                    atom_to_translate.text = bit.quick_replies[qr];
                    atom_to_translate.source_text = atom_to_translate.text;
                    atom_to_translate.note = "This is a quick reply and its translation should be uniquely identified by the corresponding argument"

                    atom_to_translate.word_count = word_count;
                    new_file.push(Object.assign({}, atom_to_translate));
                    word_count = word_count + atom_to_translate.text.split(" ").length;
                    char_count = char_count + atom_to_translate.text.length;
                }
            }
            if (bit.hasOwnProperty('arguments')) {

                var atom_to_translate = {};
                atom_to_translate.flow_id = fl;
                atom_to_translate.flow_name = obj[fl].name;
                atom_to_translate.bit_id = key_bit;
                atom_to_translate.bit_type = "arguments";
                atom_to_translate.text = bit.arguments[0];
                atom_to_translate.source_text = atom_to_translate.text;
                atom_to_translate.note = "This is an argument and it may be used to identify a corresponding quick reply"

                atom_to_translate.word_count = word_count;
                new_file.push(Object.assign({}, atom_to_translate));
                word_count = word_count + atom_to_translate.text.split(" ").length;
                char_count = char_count + atom_to_translate.text.length;
            }




        }
        /*
            if (word_count > 2000) {
                new_file = JSON.stringify(new_file, null, 2);
                //output_path = path.join(__dirname, "../products/covid-19-parenting/development/non_nested_file_for_translation_plh_master_part_" + count + ".json");
                output_path = path.join(__dirname, "../products/covid-19-parenting/development//translation/eng/file_for_translation_plh_master_activity_" + count + ".json");
                fs.writeFile(output_path, new_file, function (err, result) {
                    if (err) console.log('error', err);
                });
                word_count = 0;
                new_file = [];
                count++;
        
            }
            */

    }
    console.log("word count: "  + word_count)
    console.log("char count: "  + char_count)
    return new_file;
}

function removeRepetitions(obj) {
    const BIT_TYPES = ["text", "quick_replies", "arguments"];
    let messages = [];
    let wordCount = 0;
    let charCount = 0;

    BIT_TYPES.forEach(type => {
        const filteredByType = obj.filter(atom => atom.bit_type == type);

        const distinctText = new Set(
            filteredByType.map(x => type == "arguments" ? x.text.toLowerCase() : x.text)
        );

        distinctText.forEach(uniqueString => {
            const firstMatch = filteredByType.find(atom => {
                if (type == "arguments") {
                    return atom.text.toLowerCase() == uniqueString.toLowerCase();
                } else {
                    return atom.text == uniqueString;
                }
            });

            let newBit = {
                SourceText: uniqueString,
                text: uniqueString,
                type,
            };

            if (firstMatch.note) {
                newBit.note = firstMatch.note;
            }
            messages.push(newBit);
            wordCount = wordCount + uniqueString.split(" ").length;
            charCount = charCount + uniqueString.length;
        });
    });

    console.log ("without rep " + wordCount);
    console.log ("without rep " + charCount);
    return messages;
}

module.exports = {
    index,
    extractTextForTranslation
};
