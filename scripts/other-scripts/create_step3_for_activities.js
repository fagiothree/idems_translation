var fs = require('fs');
var path = require("path");

var input_path_interm = path.join(__dirname, "../products/covid-19-parenting/development/translation/eng/intermediary-files/source-flows/step_2_file_for_transl_activity.json");
var json_string = fs.readFileSync(input_path_interm).toString();
var obj_interm = JSON.parse(json_string);

var file_for_transl_no_rep = remove_repetitions(obj_interm);

var source_file_for_transl_no_rep = JSON.stringify(file_for_transl_no_rep, null, 2);

var input_path_transl = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/intermediary-files/source-flows/step_2_file_for_transl_activity_msa.json");
var json_string = fs.readFileSync(input_path_transl).toString();
var obj_tr = JSON.parse(json_string);

step_3 = [];
for (var bit = 0; bit < file_for_transl_no_rep.length; bit++){
    curr_bit_translation = obj_tr.filter( tr=> (tr.bit_type == file_for_transl_no_rep[bit].type && tr.source_text.toLowerCase() == file_for_transl_no_rep[bit].SourceText.toLowerCase() ));
   if (curr_bit_translation.length == 0){
        console.log("no match for bit " + curr_bit_translation[bit].text )
        break
 
    }else{
        curr_bit_translation[0].used = "y";
        var translated_bit = (Object.assign({}, file_for_transl_no_rep[bit]));
        translated_bit.text = curr_bit_translation[0].text;
        step_3.push(translated_bit);
    }
}



var not_used_transl = obj_tr.filter(tr =>(!tr.hasOwnProperty('used')))

console.log("transl bits not used: " + not_used_transl.length)


step_3 = JSON.stringify(step_3, null, 2);
output_path = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/step_3_file_for_transl_activities_msa.json");
fs.writeFile(output_path, step_3, function (err, result) {
    if (err) console.log('error', err);
});

output_path = path.join(__dirname, "../products/covid-19-parenting/development/translation/eng/step_3_file_for_transl_activity.json");
fs.writeFile(output_path, source_file_for_transl_no_rep, function (err, result) {
    if (err) console.log('error', err);
});

not_used_transl = JSON.stringify(not_used_transl, null, 2);
output_path = path.join(__dirname, "../products/covid-19-parenting/development/translation/msa/intermediary-files/source-flows/not_used_transl_activities.json");
fs.writeFile(output_path, not_used_transl, function (err, result) {
    if (err) console.log('error', err);
});


/////////////////////////////////////////////////////////////////////////
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