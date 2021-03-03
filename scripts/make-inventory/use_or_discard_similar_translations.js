var fs = require('fs');
var path = require("path");

var input_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/reviewed_couple_best_matches.json");
var json_string = fs.readFileSync(input_path).toString();
var obj_reviewed_matches = JSON.parse(json_string);


var restored_bits = [];
var partially_translated_bits = [];

obj_reviewed_matches.forEach(missing_bit => {
    if (missing_bit.bit.text == ""){
        missing_bit.bit.text = missing_bit.transl;
        partially_translated_bits.push(missing_bit.bit)

    }else{
        restored_bits.push(missing_bit.bit)
    }
    
});






restored_bits = JSON.stringify(restored_bits, null, 2);

output_path = path.join(__dirname, "../../flavour/Malaysia/input/msa/additions.json");
fs.writeFile(output_path, restored_bits, function (err, result) {
    if (err) console.log('error', err);
});

partially_translated_bits = JSON.stringify(partially_translated_bits, null, 2);

output_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa/partially_transalted_bits.json");
fs.writeFile(output_path, partially_translated_bits, function (err, result) {
    if (err) console.log('error', err);
});
