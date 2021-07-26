var fs = require('fs');
var path = require("path");
const extract = require('../extract/extract.js');


function createLocalization(latest_flows, obj_transl_full, new_lang) {
    var unused_translations = Object.assign([], obj_transl_full);
    var duplicates = "";
    var dupl_count = 1;

    // initialise output variables
    var flows_localizations = {};
    var partially_translated_flows = {};
    var missing_bits = [];

    for (var fl = 0; fl < latest_flows.flows.length; fl++){

        // create a copy of latest_flows that contains only current flow (#fl)
        var curr_flow_obj = Object.assign({}, latest_flows);
        curr_flow_obj.flows = [Object.assign({}, latest_flows.flows[fl])];

        var curr_flow_name = latest_flows.flows[fl].name;
        var curr_flow_uuid = latest_flows.flows[fl].uuid;

        // use this object to define the 3 steps for translation only for the current flow
        var step_1 = extract.extractTextForTranslation(curr_flow_obj);
        var step_2 = extract.createFileForTranslators(step_1);

        let translated_step_2 = [];

        for (var bit = 0; bit < step_2.length; bit++){
            var curr_bit_translation = obj_transl_full.filter( tr=> (tr.type == step_2[bit].bit_type && tr.SourceText.toLowerCase() == step_2[bit].text.toLowerCase() ));
            if (curr_bit_translation.length >1){
                var transl_1 = curr_bit_translation[0].text;
                var same_transl = curr_bit_translation.filter(tr => (tr.text.toLowerCase().trim() == transl_1.toLowerCase().trim()));
                if (same_transl.length == curr_bit_translation.length){
                    curr_bit_translation = [curr_bit_translation[0]];
                }
            }

            if (curr_bit_translation.length >1){

            duplicates = duplicates + dupl_count + "-------------------------------------------" +"\n" + curr_bit_translation.length + " matches for bit " + step_2[bit].text + " in flow "+ curr_flow_name + "\n";
            curr_bit_translation.forEach(bit => {
                    duplicates = duplicates + bit.text + "\n ---- \n";
            });
            let translated_bit = (Object.assign({}, step_2[bit]));
            translated_bit.text = curr_bit_translation[0].text;
            unused_translations = unused_translations.filter(tr => !(tr.type == step_2[bit].bit_type && tr.SourceText.toLowerCase().trim() == step_2[bit].text.toLowerCase().trim() ));
                dupl_count++;
            } else if (curr_bit_translation.length == 0) {

                missing_bits.push((Object.assign({}, step_2[bit])));
            } else {
                let translated_bit = (Object.assign({}, step_2[bit]));
                translated_bit.text = curr_bit_translation[0].text;
                translated_step_2.push(translated_bit);
                unused_translations = unused_translations.filter(tr => !(tr.type == step_2[bit].bit_type && tr.SourceText.toLowerCase().trim() == step_2[bit].text.toLowerCase().trim() ));
            }
        }
        // check if the flow is fully translated now:
        // if not, add to the list of flows with incomplete translation, counting the missing bits to translate
        // then proceed with reconstruction of translated step_1 (localisation)

        var new_loc = {};
        new_loc[new_lang] = translate_localization(step_1[curr_flow_uuid].localization.eng, translated_step_2,step_2);

        flows_localizations[curr_flow_uuid] = JSON.parse(JSON.stringify(step_1[curr_flow_uuid]));
        flows_localizations[curr_flow_uuid].localization = new_loc;

        if (step_2.length != translated_step_2.length){
            partially_translated_flows[latest_flows.flows[fl].name] = step_2.length - translated_step_2.length;
        }
    }


    // remove repetitions from missing bits to translate
    var missing_bits_step_3 = extract.removeRepetitions(missing_bits).map(extract.transformToTranslationFormat);


    // add localization to flows
    for (var fl = 0; fl < latest_flows.flows.length; fl++) {
        var flow_id = latest_flows.flows[fl].uuid;
        if (flows_localizations.hasOwnProperty(flow_id)) {
            latest_flows.flows[fl].localization = flows_localizations[flow_id].localization;
        }
    }

    return [
        missing_bits_step_3,
        latest_flows
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
