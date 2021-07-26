const extract = require('../extract/extract.js');


function createLocalization(latestFlows, translations, lang) {
    let unusedTranslations = Object.assign([], translations);
    let duplicates = "";
    let duplCount = 1;

    // initialise output variables
    let flowsLocalizations = {};
    let partiallyTranslatedFlows = {};
    let missingBits = [];

    for (const flow of latestFlows.flows) {
        // use this object to define the 3 steps for translation only for the current flow
        const step1 = extract.extractTextForTranslation({ flows: [flow] });
        const step2 = extract.createFileForTranslators(step1);

        let translatedStep2 = [];

        for (const bit of step2) {
            const translationMatches = translations.filter(tr =>
                tr.type == bit.bit_type && tr.SourceText.toLowerCase() == bit.text.toLowerCase()
            );
            if (translationMatches.length > 1) {
                const firstMatch = translationMatches[0];
                const isIdentical = translationMatches.every(tr =>
                    tr.text.toLowerCase().trim() == firstMatch.text.toLowerCase().trim()
                );
                if (isIdentical) {
                    translationMatches.splice(1);
                }
            }

            if (translationMatches.length > 1) {
                duplicates = duplicates + duplCount + "-------------------------------------------" +"\n" + translationMatches.length + " matches for bit " + bit.text + " in flow "+ flow.name + "\n";
                translationMatches.forEach(translation => {
                    duplicates = duplicates + translation.text + "\n ---- \n";
                });
                let translatedBit = Object.assign({}, bit);
                translatedBit.text = translationMatches[0].text;
                unusedTranslations = unusedTranslations.filter(tr =>
                    !(tr.type == bit.bit_type &&
                      tr.SourceText.toLowerCase().trim() == bit.text.toLowerCase().trim())
                );
                duplCount++;
            } else if (translationMatches.length == 0) {
                missingBits.push(Object.assign({}, bit));
            } else {
                let translatedBit = Object.assign({}, bit);
                translatedBit.text = translationMatches[0].text;
                translatedStep2.push(translatedBit);
                unusedTranslations = unusedTranslations.filter(tr =>
                    !(tr.type == bit.bit_type &&
                      tr.SourceText.toLowerCase().trim() == bit.text.toLowerCase().trim())
                );
            }
        }
        // check if the flow is fully translated now:
        // if not, add to the list of flows with incomplete translation, counting the missing bits to translate
        // then proceed with reconstruction of translated step_1 (localisation)

        let localization = {};
        localization[lang] = translate_localization(
            step1[flow.uuid].localization.eng,
            translatedStep2,
            step2
        );

        flowsLocalizations[flow.uuid] = JSON.parse(JSON.stringify(step1[flow.uuid]));
        flowsLocalizations[flow.uuid].localization = localization;

        if (step2.length != translatedStep2.length){
            partiallyTranslatedFlows[flow.name] = step2.length - translatedStep2.length;
        }
    }

    // remove repetitions from missing bits to translate
    const missingBitsStep3 = extract.removeRepetitions(missingBits)
          .map(extract.transformToTranslationFormat);

    // add localization to flows
    for (let flow of latestFlows.flows) {
        if (flowsLocalizations[flow.uuid]) {
            flow.localization = flowsLocalizations[flow.uuid].localization;
        }
    }

    return [
        missingBitsStep3,
        latestFlows
    ];
}

/////////////////////////////////////////////////////////////////
// function to translate localisation
///////////////////////////////////////////////////////////////

function translate_localization(eng_loc, transl_step_2, eng_step_2){
    var nl = "\n";
    translated_loc = JSON.parse(JSON.stringify(eng_loc));
    var n_partially_transl_nodes = 0;
    for (bit_id in translated_loc){
        if (transl_step_2.filter(function (atom) { return (atom.bit_id == bit_id) }).length != eng_step_2.filter(function (atom) { return (atom.bit_id == bit_id) }).length){
            n_partially_transl_nodes++
            continue
        }
        var bit = translated_loc[bit_id];
        if (bit.hasOwnProperty('text')) {
            translated_loc[bit_id].text[0] = "";
            var corresp_atoms = transl_step_2.filter(function (atom) { return (atom.bit_id == bit_id && atom.bit_type == "text") });
            corresp_atoms = corresp_atoms.sort(function (a, b) { return a.type_id - b.type_id });
            for (tx = 0; tx < corresp_atoms.length; tx++) {
                if (tx == 0) {
                    if (corresp_atoms[tx].hasOwnProperty('has_bullet') && corresp_atoms[tx].has_bullet == true){
                        translated_loc[bit_id].text[0] = translated_loc[bit_id].text[0] + "•\t" + corresp_atoms[tx].text;
                    }
                    else{
                        translated_loc[bit_id].text[0] =  translated_loc[bit_id].text[0] + corresp_atoms[tx].text;
                    }
                }
                else {
                    if (corresp_atoms[tx].hasOwnProperty('has_bullet') && corresp_atoms[tx].has_bullet == true){
                        translated_loc[bit_id].text[0] =  translated_loc[bit_id].text[0] + nl.repeat(corresp_atoms[tx].has_extraline+1) + "•\t" + corresp_atoms[tx].text;
                    }
                    else{
                        translated_loc[bit_id].text[0] = translated_loc[bit_id].text[0] + nl.repeat(corresp_atoms[tx].has_extraline+1) + corresp_atoms[tx].text;
                    }
                }
            }
        }
        if (bit.hasOwnProperty('quick_replies')) {
            translated_loc[bit_id].quick_replies = [];
            let corresp_atoms = transl_step_2.filter(function (atom) {
                return (atom.bit_id == bit_id && atom.bit_type == "quick_replies");
            });
            corresp_atoms = corresp_atoms.sort(function (a, b) { return a.type_id - b.type_id; });
            for (qr = 0; qr < corresp_atoms.length; qr++) {
                translated_loc[bit_id].quick_replies.push(corresp_atoms[qr].text);
            }

        }
        if (bit.hasOwnProperty('arguments')) {
            translated_loc[bit_id].arguments = [];
            let corresp_atoms = transl_step_2.filter(function (atom) {
                return (atom.bit_id == bit_id && atom.bit_type == "arguments");
            });
            if (corresp_atoms.length>0){
                translated_loc[bit_id].arguments.push(corresp_atoms[0].text);
            } else {
                console.log("no match arguments");
            }
        }
    }

    return translated_loc;
}

module.exports = {
    createLocalization
};
