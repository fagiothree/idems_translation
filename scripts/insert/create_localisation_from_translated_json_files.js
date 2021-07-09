var fs = require('fs');
var path = require("path");


let input_args = process.argv.slice(2);


// load latest version of the flows
let input_path = input_args[0];
//var input_path = path.join(__dirname, "../../flavour/Malaysia/input/plh-international-flavour_ABtesting.json");
var json_string = fs.readFileSync(input_path).toString();
var latest_flows = JSON.parse(json_string);


//var new_lang = "msa";
var new_lang = input_args[2];


//var input_path_transl = path.join(__dirname, "../../flavour/Malaysia/inventory/msa_translation_OFFICIAL.json");
var input_path_transl = input_args[1];
var json_string = fs.readFileSync(input_path_transl).toString();
var obj_transl_full = JSON.parse(json_string);

/*
// load all translated files
var input_path_transl_2 = path.join(__dirname, "../../flavour/Malaysia/input/msa/step_3_file_for_transl_content_msa.json");
var input_path_transl_3 = path.join(__dirname, "../../flavour/Malaysia/input/msa/step_3_file_for_transl_supportive_msa.json");
var input_path_transl_1 = path.join(__dirname, "../../flavour/Malaysia/input/msa/step_3_file_for_transl_activities_msa.json");
var input_path_transl_4 = path.join(__dirname, "../../flavour/Malaysia/input/msa/step_3_file_for_transl_remaining_msa.json");
var input_path_transl_5 = path.join(__dirname, "../../flavour/Malaysia/input/msa/additions.json");
var input_path_transl_6 = path.join(__dirname, "../../flavour/Malaysia/input/msa/msa_missing_bits_to_translate_MS.json");
var input_path_transl_7 = path.join(__dirname, "../../flavour/Malaysia/input/msa/english_RUMAYA_ab_testing_restored_additions_MS_revision.json");
var input_path_transl_8 = path.join(__dirname, "../../flavour/Malaysia/input/msa/TWB_ab_test_to_translate_checkins_restored_MS.json");
var input_path_transl_9 = path.join(__dirname, "../../flavour/Malaysia/input/msa/extra_checkins_MS.json");
var input_path_transl_10 = path.join(__dirname, "../../flavour/Malaysia/input/msa/being_translated/comics.json");

var json_string_1 = fs.readFileSync(input_path_transl_1).toString();
var json_string_2 = fs.readFileSync(input_path_transl_2).toString();
var json_string_3 = fs.readFileSync(input_path_transl_3).toString();
var json_string_4 = fs.readFileSync(input_path_transl_4).toString();
var json_string_5 = fs.readFileSync(input_path_transl_5).toString();
var json_string_6 = fs.readFileSync(input_path_transl_6).toString();
var json_string_7 = fs.readFileSync(input_path_transl_7).toString();
var json_string_8 = fs.readFileSync(input_path_transl_8).toString();
var json_string_9 = fs.readFileSync(input_path_transl_9).toString();
var json_string_10 = fs.readFileSync(input_path_transl_10).toString();


var obj_transl_1 = JSON.parse(json_string_1);
var obj_transl_2 = JSON.parse(json_string_2);
var obj_transl_3 = JSON.parse(json_string_3);
var obj_transl_4 = JSON.parse(json_string_4);
var obj_transl_5 = JSON.parse(json_string_5);
var obj_transl_6 = JSON.parse(json_string_6);
var obj_transl_7 = JSON.parse(json_string_7);
var obj_transl_8 = JSON.parse(json_string_8);
var obj_transl_9 = JSON.parse(json_string_9);
var obj_transl_10 = JSON.parse(json_string_10);

var obj_transl_full = obj_transl_1.concat(obj_transl_2).concat(obj_transl_3).concat(obj_transl_4).concat(obj_transl_5).concat(obj_transl_6).concat(obj_transl_7).concat(obj_transl_8).concat(obj_transl_9).concat(obj_transl_10);
var all_transl = JSON.stringify(obj_transl_1.concat(obj_transl_2).concat(obj_transl_3).concat(obj_transl_4).concat(obj_transl_5).concat(obj_transl_6).concat(obj_transl_7).concat(obj_transl_8).concat(obj_transl_9), null, 2);

*/


var unused_translations = Object.assign([], obj_transl_full);

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
    var step_1 = extract_bits_to_be_translated(curr_flow_obj);
    var step_2 = create_file_for_translators(step_1);
    
    translated_step_2 = [];

    // create translation for step_2 using the translated files (in format step_3), 
    
    /*
    // first looking into the corresponding set of translations based on the flow name, and then into
    // the others if there is no match

    if (curr_flow_name.startsWith("PLH - Activity")){
        var corresp_transl_set = obj_transl_1;
    }
    else if (curr_flow_name.startsWith("PLH - Content")){
        var corresp_transl_set = obj_transl_2;
    }
    else if (curr_flow_name.startsWith("PLH - Supportive")){
        var corresp_transl_set = obj_transl_3;
    }
    else{
        var corresp_transl_set = obj_transl_4;
    }
    */

    for (var bit = 0; bit < step_2.length; bit++){
        /*
        var curr_bit_translation = corresp_transl_set.filter( tr=> (tr.type == step_2[bit].bit_type && tr.SourceText.toLowerCase() == step_2[bit].text.toLowerCase() ));
        if  (curr_bit_translation.length == 0){
            curr_bit_translation = obj_transl_full.filter( tr=> (tr.type == step_2[bit].bit_type && tr.SourceText.toLowerCase() == step_2[bit].text.toLowerCase() ));
        }
        */

        var curr_bit_translation = obj_transl_full.filter( tr=> (tr.type == step_2[bit].bit_type && tr.SourceText.toLowerCase() == step_2[bit].text.toLowerCase() )); 
        if (curr_bit_translation.length >1){
            
            var transl_1 = curr_bit_translation[0].text;
            var same_transl = curr_bit_translation.filter(tr => (tr.text.toLowerCase().trim() == transl_1.toLowerCase().trim()));
            if (same_transl.length == curr_bit_translation.length){
                curr_bit_translation = [curr_bit_translation[0]]; 
    
            }
            
        }

        if (curr_bit_translation.length >1){
           // console.log("error: " + curr_bit_translation.length + " matches for bit " + step_2[bit].text + " in flow "+ curr_flow_name)
            //curr_bit_translation.forEach(bit => { console.log(bit.text)})
            break
        } else if (curr_bit_translation.length == 0){

            missing_bits.push((Object.assign({}, step_2[bit])))
        }
        else{
            
            var translated_bit = (Object.assign({}, step_2[bit]));
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
var missing_bits_step_3 = remove_repetitions(missing_bits);


// add localization to flows
for (var fl = 0; fl < latest_flows.flows.length; fl++) {
    var flow_id = latest_flows.flows[fl].uuid;
    if (flows_localizations.hasOwnProperty(flow_id)) {
        latest_flows.flows[fl].localization = flows_localizations[flow_id].localization;
    }
}



/*
partially_translated_flows = JSON.stringify(partially_translated_flows, null, 2);
var output_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/inventory_partially_translated_flows.json");
fs.writeFile(output_path, partially_translated_flows, function (err, result) {
    if (err) console.log('error', err);
});


unused_translations = JSON.stringify(unused_translations, null, 2);
var output_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/inventory_unused_translations_step_3.json");
fs.writeFile(output_path, unused_translations, function (err, result) {
    if (err) console.log('error', err);
});


flows_localizations = JSON.stringify(flows_localizations, null, 2);
var output_path = path.join(__dirname, "../../flavour/Malaysia/intermediary/msa/flows_localisations.json");
fs.writeFile(output_path, flows_localizations, function (err, result) {
    if (err) console.log('error', err);
});
*/


missing_bits_step_3 = JSON.stringify(missing_bits_step_3, null, 2);
//var output_path_missing = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/missing.json");
var output_path_missing = input_args[4];
fs.writeFile(output_path_missing, missing_bits_step_3, function (err, result) {
    if (err) console.log('error', err);
});



var flows_with_localiz = JSON.stringify(latest_flows, null, 2);
// var output_path_flows = path.join(__dirname, "../../flavour/Malaysia/output/plh_malaysia_flavour_msa.json");
var output_path_flows = input_args[3];
fs.writeFile(output_path_flows, flows_with_localiz, function (err, result) {
    if (err) console.log('error', err);
});




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
            var corresp_atoms = transl_step_2.filter(function (atom) { return (atom.bit_id == bit_id && atom.bit_type == "quick_replies") });
            corresp_atoms = corresp_atoms.sort(function (a, b) { return a.type_id - b.type_id });
            for (qr = 0; qr < corresp_atoms.length; qr++) {
                translated_loc[bit_id].quick_replies.push(corresp_atoms[qr].text);
            }

        }
        if (bit.hasOwnProperty('arguments')) {
            translated_loc[bit_id].arguments = [];
            var corresp_atoms = transl_step_2.filter(function (atom) { return (atom.bit_id == bit_id && atom.bit_type == "arguments") });
            if (corresp_atoms.length>0){
                translated_loc[bit_id].arguments.push(corresp_atoms[0].text);
            }else{
                console.log("no match arguments")
            }

        }

    }


    //console.log("partially transl nodes: " + n_partially_transl_nodes)
    return translated_loc
}

/////////////////////////////////////////////////////////////////
// functions to create files for translators
///////////////////////////////////////////////////////////////

////////////////////////// step 1
function extract_bits_to_be_translated(obj) {
    var bits_to_translate = {};
    var localization = {};
    var eng_localization = {};

    var word_tests = ["has_any_word", "has_all_words", "has_phrase", "has_only_phrase", "has_beginning"];



    for (var fl = 0; fl < obj.flows.length; fl++) {
        for (var n = 0; n < obj.flows[fl].nodes.length; n++) {
            for (var ac = 0; ac < obj.flows[fl].nodes[n].actions.length; ac++) {
                var curr_act = obj.flows[fl].nodes[n].actions[ac];
                if (curr_act.type == "send_msg") {
                    var msg_id = curr_act.uuid;
                    var trasl_to_add = {};
                    trasl_to_add.text = [curr_act.text];
                    trasl_to_add.quick_replies = curr_act.quick_replies;
                    eng_localization[msg_id] = trasl_to_add;
                }
            }
            if (obj.flows[fl].nodes[n].hasOwnProperty('router')) {
                if (obj.flows[fl].nodes[n].router.operand == "@input.text") {
                    for (var c = 0; c < obj.flows[fl].nodes[n].router.cases.length; c++) {
                        var curr_case = obj.flows[fl].nodes[n].router.cases[c];
                        if (word_tests.includes(curr_case.type)) {
                            var case_id = curr_case.uuid;
                            var trasl_to_add = {};
                            trasl_to_add.arguments = curr_case.arguments;
                            eng_localization[case_id] = trasl_to_add;

                        }
                    }

                }



            }
        }

        var flow_id = obj.flows[fl].uuid;
        var flow_info = {};
        flow_info.flowid = flow_id;
        flow_info.name = obj.flows[fl].name;
        localization.eng = eng_localization;
        flow_info.localization = localization;
        bits_to_translate[flow_id] = flow_info;
        localization = {};
        eng_localization = {};
    }
    return bits_to_translate;
}



///////////////// step 2

function create_file_for_translators(obj) {

    var new_file = [];
    var word_count = 0;
    var count = 1;

    for (var fl in obj) {
        
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
            }




        }
        
    }
    
    return new_file;
}



///////////////////// step 3
function remove_repetitions(obj) {
    
    var new_file = [];

    var word_count = 0;
    var bit_types = ["text", "quick_replies", "arguments"];
    var new_bit = {};

    bit_types.forEach((type) => {
        var obj_filtered = obj.filter(function (atom) { return (atom.bit_type == type) });

        var distinct_text = [... new Set(obj_filtered.map(x => { if (type == "arguments") { return x.text.toLowerCase() } else { return x.text } }))];

        distinct_text.forEach((unique_string) => {
            var obj_same_text = obj_filtered.filter(function (atom) {if (type == "arguments") {return (atom.text.toLowerCase() == unique_string.toLowerCase())}else{return(atom.text == unique_string)} });
           
            new_bit.SourceText = unique_string;
            new_bit.text = unique_string;
            new_bit.type = type;
            if (obj_same_text[0].hasOwnProperty('note')) { new_bit.note = obj_same_text[0].note };
            new_file.push(Object.assign({}, new_bit));
            word_count = word_count + unique_string.split(" ").length;
            new_bit = {};
        })

    });

    console.log ("without rep " + word_count)
return new_file;
}












