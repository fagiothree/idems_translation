const extract = require('../extract/extract.js');


function createLocalization(latestFlows, translations, lang) {
    let unusedTranslations = Object.assign([], translations);
    let duplicates = "";
    let duplCount = 1;
    let translSpaces = [{
        "SourceText": "  ",
        "text": "  ",
        "type": "text"
      },
      {
        "SourceText": " ",
        "text": " ",
        "type": "text"
      }
     ]
    translations = translations.concat(translSpaces)
    

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
                tr.type == bit.bit_type && tr.SourceText.toLowerCase().trim() == bit.text.toLowerCase().trim()
            );
            
            if (translationMatches.length >= 1){
                let translatedBit = Object.assign({}, bit);
                translatedBit.text = translationMatches[0].text;

                translatedStep2.push(translatedBit);
                unusedTranslations = unusedTranslations.filter(tr =>
                    !(tr.type == bit.bit_type &&
                      tr.SourceText.toLowerCase().trim() == bit.text.toLowerCase().trim())
                );
               
                if (translationMatches.length >1){
    
                    duplicates = duplicates + duplCount + "-------------------------------------------" +"\n" + translationMatches.length + " matches for bit " + bit.text + " in flow "+ flow.name + "\n";
                    translationMatches.forEach(translation => {
                    duplicates = duplicates + translation.text + "\n ---- \n";
                });
                duplCount++;
                }
            } else {
                missingBits.push(Object.assign({}, bit));
            }
        

            /* ///// old code
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
            ///// old code */
        }
        
        // check if the flow is fully translated now:
        // if not, add to the list of flows with incomplete translation, counting the missing bits to translate
        // then proceed with reconstruction of translated step_1 (localisation)

        let localization = {};
        localization = translateLocalization(
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
    const missingBitsStep3 = extract.removeRepetitions(missingBits)[0]
          .map(extract.transformToTranslationFormat);

    // add localization to flows
    for (let flow of latestFlows.flows) {
        if (flowsLocalizations[flow.uuid]) {
            if (!flow.hasOwnProperty("localization")){             
                flow.localization = {};              
            }
            flow.localization[lang] = flowsLocalizations[flow.uuid].localization;
        }
    }

    return [
        missingBitsStep3,
        partiallyTranslatedFlows,
        latestFlows
    ];
}

function translateLocalization(engLoc, translStep2, engStep2) {
    const NEWLINE = '\n';
    const BULLET = '•\t';
    const byTypeId = (a, b) => a.type_id - b.type_id;
    let translatedLoc = JSON.parse(JSON.stringify(engLoc));
    let nPartiallyTranslNodes = 0;

    for (let [bitId, bit] of Object.entries(translatedLoc)) {
        const byBitId = (x) => x.bit_id == bitId;

        if (translStep2.filter(byBitId).length != engStep2.filter(byBitId).length) {
            nPartiallyTranslNodes++;
            continue;
        }

        if (bit.hasOwnProperty('text')) {
            bit.text[0] = translStep2
                .filter(byBitId)
                .filter(atom => atom.bit_type == "text")
                .sort(byTypeId)
                .map(atom => {
                    const newlines = NEWLINE.repeat(atom.has_extraline);
                    const bullet = atom.has_bullet ? BULLET : '';
                    return newlines + bullet + atom.text;
                })
                .join(NEWLINE);
        }

        if (bit.hasOwnProperty('quick_replies')) {
            bit.quick_replies = translStep2
                .filter(byBitId)
                .filter(atom => atom.bit_type == "quick_replies")
                .sort(byTypeId)
                .map(atom => atom.text);
        }

        if (bit.hasOwnProperty('variables')) {
            bit.variables = translStep2
                .filter(byBitId)
                .filter(atom => atom.bit_type == "variables")
                .sort(byTypeId)
                .map(atom => atom.text);
        }

        if (bit.hasOwnProperty('arguments')) {
            bit.arguments = translStep2
                .filter(byBitId)
                .filter(atom => atom.bit_type == "arguments")
                .map(atom => atom.text);
            if (bit.arguments.length == 0) {
                console.log("no match arguments");
            }
        }
    }

    return translatedLoc;
}

module.exports = {
    createLocalization
};
