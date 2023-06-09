function reorderFlowsAlphabeticallyByName(obj) {
    obj.flows.sort(function (a, b) {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
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

                    eng_localization[action.templating.uuid] = {
                        variables: action.templating.variables
                    }
                }
            });

            if (node.router && node.router.operand === '@input.text') {
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

    const average = bitsLengths.reduce((a, b) => a + b, 0) / bitsLengths.length;
    //console.log("average length " + average);
    //console.log(bitsLengths);
    return bitsToTranslate;
}

function createFileForTranslators(obj) {
    let newFile = [];
    let wordCount = 0;
    let charCount = 0;

    for (const [flow_id, flow] of Object.entries(obj)) {
        const localization = flow.localization.eng;
        for (const [key_bit, bit] of Object.entries(localization)) {
            if (bit.text) {
                const lines = bit.text[0].split("\n");
                let atom_to_translate = {
                    has_extraline: 0
                };
                lines.forEach((line, i) => {
                    if (line === "") {
                        atom_to_translate.has_extraline++;
                    }
                    else {
                        atom_to_translate.flow_id = flow_id;
                        atom_to_translate.flow_name = flow.name;
                        atom_to_translate.bit_id = key_bit;
                        atom_to_translate.bit_type = "text";
                        atom_to_translate.type_id = i;
                        if (line.startsWith("•\t")) {
                            atom_to_translate.text = line.replace("•\t", "");
                            atom_to_translate.has_bullet = true;
                        }
                        else {
                            atom_to_translate.text = line;
                        }
                        if (line.indexOf("@") > -1) {
                            atom_to_translate.note = "Strings like @fields.xxx and @results.yyy should not be translated. ";
                            if (line.indexOf("survey") > -1) {
                                atom_to_translate.note = atom_to_translate.note + "@fields.survey_behave_name is the name of the child";
                            }
                            if (line.indexOf("count") > -1) {
                                atom_to_translate.note = atom_to_translate.note + "@results.count is a number (counter for list)";
                            }
                            if (line.indexOf("skills") > -1) {
                                atom_to_translate.note = atom_to_translate.note + "@results.n_skills_week and results.n_skills are numbers";
                            }
                        }
                        atom_to_translate.word_count = wordCount;
                        atom_to_translate.source_text = atom_to_translate.text;
                        newFile.push(Object.assign({}, atom_to_translate));
                        wordCount = wordCount + atom_to_translate.text.split(" ").length;
                        charCount = charCount + atom_to_translate.text.length;
                        atom_to_translate = {};
                        atom_to_translate.has_extraline = 0;
                    }
                });
            }

            if (bit.quick_replies) {
                bit.quick_replies.forEach((qr, i) => {
                    let atom_to_translate = {};
                    atom_to_translate.flow_id = flow_id;
                    atom_to_translate.flow_name = flow.name;
                    atom_to_translate.bit_id = key_bit;
                    atom_to_translate.bit_type = "quick_replies";
                    atom_to_translate.type_id = i;
                    atom_to_translate.text = qr;
                    atom_to_translate.source_text = atom_to_translate.text;
                    atom_to_translate.note = "This is a quick reply and its translation should be uniquely identified by the corresponding argument";

                    atom_to_translate.word_count = wordCount;
                    newFile.push(atom_to_translate);
                    wordCount = wordCount + atom_to_translate.text.split(" ").length;
                    charCount = charCount + atom_to_translate.text.length;
                });
            }

            if (bit.variables) {
                bit.variables.forEach((qr, i) => {
                    let atom_to_translate = {};
                    atom_to_translate.flow_id = flow_id;
                    atom_to_translate.flow_name = flow.name;
                    atom_to_translate.bit_id = key_bit;
                    atom_to_translate.bit_type = "variables";
                    atom_to_translate.type_id = i;
                    atom_to_translate.text = qr;
                    atom_to_translate.source_text = atom_to_translate.text;

                    atom_to_translate.word_count = wordCount;
                    newFile.push(atom_to_translate);
                    wordCount = wordCount + atom_to_translate.text.split(" ").length;
                    charCount = charCount + atom_to_translate.text.length;
                });
            }

            if (bit.arguments) {
                let atom_to_translate = {};
                atom_to_translate.flow_id = flow_id;
                atom_to_translate.flow_name = flow.name;
                atom_to_translate.bit_id = key_bit;
                atom_to_translate.bit_type = "arguments";
                atom_to_translate.text = bit.arguments[0];
                atom_to_translate.source_text = atom_to_translate.text;
                atom_to_translate.note = "This is an argument and it may be used to identify a corresponding quick reply";

                atom_to_translate.word_count = wordCount;
                newFile.push(atom_to_translate);
                wordCount = wordCount + atom_to_translate.text.split(" ").length;
                charCount = charCount + atom_to_translate.text.length;
            }
        }
    }
    //console.log("word count: "  + wordCount);
    //console.log("char count: "  + charCount);
    return newFile;
}

function removeRepetitions(obj) {
    const BIT_TYPES = ["text", "quick_replies", "variables", "arguments"];
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

            messages.push(firstMatch);
            wordCount = wordCount + uniqueString.split(" ").length;
            charCount = charCount + uniqueString.length;
        });
    });

    console.log ("word count: " + wordCount);
    //console.log ("without rep " + charCount);
    return [messages, wordCount];
}

function transformToTranslationFormat(message) {
    let transformed = {};

    if (message.bit_type === 'arguments') {
        transformed.SourceText = message.source_text.toLowerCase();
        transformed.text = message.text.toLowerCase();
    } else {
        transformed.SourceText = message.source_text;
        transformed.text = message.text;
    }

    transformed.type = message.bit_type;

    if (message.note) {
        transformed.note = message.note;
    }
    return transformed;
}

module.exports = {
    extractTextForTranslation,
    createFileForTranslators,
    removeRepetitions,
    transformToTranslationFormat,
};
