var fs = require('fs');
var path = require("path");

/*
var input_path_interm = path.join(__dirname, "../products/covid-19-parenting/development/translation/eng/intermediary-files/step_2_file_for_transl_content.json");
var json_string = fs.readFileSync(input_path_interm).toString();
var obj_interm = JSON.parse(json_string);

var input_path_transl = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/Flow_set_2_RapidPro_MS_content.json");
var json_string = fs.readFileSync(input_path_transl).toString();
var obj_tr = JSON.parse(json_string);


for (var bit = 0; bit < obj_interm.length; bit++){
    curr_bit_translation = obj_tr.filter( tr=> (tr.type == obj_interm[bit].bit_type && tr.SourceText.toLowerCase() == obj_interm[bit].text.toLowerCase() ));
    if (curr_bit_translation.length !=1){
        console.log("error with bit " + obj_interm[bit].text)
        break
    }else{
        curr_bit_translation = curr_bit_translation[0];
        obj_interm[bit].source_text = obj_interm[bit].text;
        obj_interm[bit].text = curr_bit_translation.text;
    }
}

new_file = JSON.stringify(obj_interm, null, 2);
output_path = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/intermediary/step_2_file_for_transl_content_msa.json");
fs.writeFile(output_path, new_file, function (err, result) {
    if (err) console.log('error', err);
});
*/

/// add sourcetext to activity translation 
var input_path_interm = path.join(__dirname, "../products/covid-19-parenting/development/translation/eng/file_for_translation_plh_master_activity.json");
var json_string = fs.readFileSync(input_path_interm).toString();
var obj_interm = JSON.parse(json_string);

var input_path_transl = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/intermediary/file_for_translation_plh_master_activity.out_MS.json");
var json_string = fs.readFileSync(input_path_transl).toString();
var obj_tr = JSON.parse(json_string);

for (var bit = 0; bit < obj_interm.length; bit++){
    curr_bit_translation = obj_tr.filter( tr=> (tr.bit_id == obj_interm[bit].bit_id && tr.bit_type == obj_interm[bit].bit_type && tr.type_id == obj_interm[bit].type_id ));
    if (curr_bit_translation.length !=1){
        console.log("error with bit " + obj_interm[bit].text)
        break
    }else{
        curr_bit_translation = curr_bit_translation[0];
        obj_interm[bit].source_text = obj_interm[bit].text;
        obj_interm[bit].text = curr_bit_translation.text;
    }
}

new_file = JSON.stringify(obj_interm, null, 2);
output_path = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/intermediary/step_2_file_for_transl_activity_msa.json");
fs.writeFile(output_path, new_file, function (err, result) {
    if (err) console.log('error', err);
});


