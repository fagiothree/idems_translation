var fs = require('fs');
var path = require("path");

var input_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/partially_transalted_bits.json");
var json_string = fs.readFileSync(input_path).toString();
var suggested_bits = JSON.parse(json_string);


var input_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/missing_bits_to_translate.json");
var json_string = fs.readFileSync(input_path).toString();
var missing_bits = JSON.parse(json_string);



missing_bits.forEach(miss_bit => {
    var matching = suggested_bits.filter(sugg_bit =>(sugg_bit["SourceText"] == miss_bit["SourceText"]))
    if (matching.length == 1){
        miss_bit.text = matching[0].text;
    } else if (matching.length > 1){
        console.log("error")
    }
    
});


missing_with_suggestion = JSON.stringify(missing_bits, null, 2);

output_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/missing_bits_with_suggestion.json");
fs.writeFile(output_path, missing_with_suggestion, function (err, result) {
    if (err) console.log('error', err);
});
