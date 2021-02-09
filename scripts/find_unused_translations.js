var fs = require('fs');
var path = require("path");



//var input_path_interm = path.join(__dirname, "../../products/covid-19-parenting/development/translation/eng/intermediary-files/current-flows/current_step_2_file_for_transl_content.json");
//var input_path_interm = path.join(__dirname, "../../products/covid-19-parenting/development/translation/eng/intermediary-files/current-flows/current_step_2_file_for_transl_supportive.json");
var input_path_interm = path.join(__dirname, "../../products/covid-19-parenting/development/translation/eng/intermediary-files/current-flows/current_step_2_file_for_transl_activities.json");
var json_string = fs.readFileSync(input_path_interm).toString();
var obj_interm = JSON.parse(json_string);

//var input_path_transl = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/step_3_file_for_transl_content_msa.json");
//var input_path_transl = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/step_3_file_for_transl_supportive_msa.json");
var input_path_transl = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/step_3_file_for_transl_activities_msa.json");
var json_string = fs.readFileSync(input_path_transl).toString();
var obj_tr = JSON.parse(json_string);

var missing_bits = [];
var translated_interm = [];



// to go from step 3 translated to step 2 of the current version of flows, keeping track of the
// missing bits to translate and of the translations not used 
for (var bit = 0; bit < obj_interm.length; bit++){
    var curr_bit_translation = obj_tr.filter( tr=> (tr.type == obj_interm[bit].bit_type && tr.SourceText.toLowerCase() == obj_interm[bit].text.toLowerCase() ));
    if (curr_bit_translation.length >1){
        console.log("error: too many matches for bit " + obj_interm[bit].text )
        break
    } else if (curr_bit_translation.length == 0){
        console.log(obj_interm[bit].flow_name)
        missing_bits.push((Object.assign({}, obj_interm[bit])))
    }else{
        curr_bit_translation[0].used = "y";
        var translated_bit = (Object.assign({}, obj_interm[bit]));
        translated_bit.text = curr_bit_translation[0].text;
        translated_interm.push(translated_bit);
    }
}

/*
// To compare step 2 of the current version of flows with step 2 used for translation 
// (in case the json used for translation is step 2 instead of step 3), which also keeps track of the missing bits to translate

for (var bit = 0; bit < obj_interm.length; bit++){
    var curr_bit_translation = obj_tr.filter( tr=> (tr.flow_id == obj_interm[bit].flow_id && tr.bit_id == obj_interm[bit].bit_id && tr.type == obj_interm[bit].bit_type && tr.source_text == obj_interm[bit].source_text ));
    if (curr_bit_translation.length >1){
        console.log("error: too many matches for bit " + obj_interm[bit].text )
        break
    } else if (curr_bit_translation.length == 0){
        //console.log("no match for bit " + obj_interm[bit].text )
        console.log(obj_interm[bit].flow_name)
        missing_bits.push((Object.assign({}, obj_interm[bit])))
    }else{
        curr_bit_translation[0].used = "y";  
        translated_interm.push(Object.assign({}, obj_interm[bit]));
    }
}
*/

var not_used_transl = obj_tr.filter(tr =>(!tr.hasOwnProperty('used')))

console.log("transl bits not used: " + not_used_transl.length)


translated_interm = JSON.stringify(translated_interm, null, 2);
//var output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/current_step_2_file_for_transl_content_msa.json");
//var output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/current_step_2_file_for_transl_supportive_msa.json");
var output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/current_step_2_file_for_transl_activities_msa.json");
fs.writeFile(output_path, translated_interm, function (err, result) {
    if (err) console.log('error', err);
});

missing_bits = JSON.stringify(missing_bits, null, 2);
//output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/step_2_missing_translations_content_msa.json");
//output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/step_2_missing_translations_supportive_msa.json");
output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/step_2_missing_translations_activities_msa.json");
fs.writeFile(output_path, missing_bits, function (err, result) {
    if (err) console.log('error', err);
});

not_used_transl = JSON.stringify(not_used_transl, null, 2);
//output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/not_used_transl_content_msa.json");
//output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/not_used_transl_translations_supportive_msa.json");
output_path = path.join(__dirname, "../../products/covid-19-parenting/development/translation/msa/intermediary-files/current-flows/not_used_transl_translations_activities_msa.json");
fs.writeFile(output_path, not_used_transl, function (err, result) {
    if (err) console.log('error', err);
});





