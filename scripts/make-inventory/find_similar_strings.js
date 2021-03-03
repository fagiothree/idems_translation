var fs = require('fs');
var path = require("path");
var stringSimilarity = require("string-similarity");

var input_path_unused = path.join(__dirname, "../flavour/Malaysia/inventory/msa/inventory_unused_translations_step_3.json");
var json_string_unused = fs.readFileSync(input_path_unused).toString();
var unused_transl = JSON.parse(json_string_unused);

var input_path_missing = path.join(__dirname, "../flavour/Malaysia/inventory/msa/missing_bits_to_translate.json");
var json_string_missing = fs.readFileSync(input_path_missing).toString();
var missing_transl = JSON.parse(json_string_missing);


var list_of_unused = [];
unused_transl.forEach(bit => {list_of_unused.push(bit["SourceText"])});

var couples_best_matches = [];

missing_transl.forEach(bit =>{
    var couple ={};
    var best_match = stringSimilarity.findBestMatch(bit["SourceText"], list_of_unused);
    if (best_match.bestMatch.rating>=0.8){
        couple["missing"] = bit["SourceText"];
        couple["best-match"] = unused_transl[best_match.bestMatchIndex].SourceText; //best_match.bestMatch.target;
        couple["transl"] = unused_transl[best_match.bestMatchIndex].text;
        couple["bit"] = bit;
        couple.bit.text = couple.transl;
        couples_best_matches.push(couple);
    }
   
})

console.log(couples_best_matches.length)
couples_best_matches = JSON.stringify(couples_best_matches, null, 2);
var output_path = path.join(__dirname, "../flavour/Malaysia/inventory/msa/couple_best_matches.json");
fs.writeFile(output_path, couples_best_matches, function (err, result) {
    if (err) console.log('error', err);
});



