var fs = require('fs');
var path = require("path");

const input_path = path.join(__dirname, "../../flavour/Malaysia/inventory/msa_translation_OFFICIAL.json");
const json_string = fs.readFileSync(input_path).toString();
let all_transl_bits = JSON.parse(json_string);

let  duplicates = [];

while(all_transl_bits.length>0){
    let curr_bit = all_transl_bits[0];
    let matching_bits = all_transl_bits.filter(bit => (bit.SourceText.toLowerCase().trim() == curr_bit.SourceText.toLowerCase().trim()));
    if (matching_bits.length>1){
        let matching_transl_bits = matching_bits.filter(bit => (bit.text.toLowerCase().trim() == curr_bit.text.toLowerCase().trim()))
        if (matching_bits.length != matching_transl_bits.length){
            let dupl = {};
            dupl.SourceText = [];
            dupl.type = [];
            dupl.transl = [];
            matching_bits.forEach(bit => {
                dupl.SourceText.push(bit.SourceText);
                dupl.type.push(bit.type);
                dupl.transl.push(bit.text);
            });
            duplicates.push(dupl)
        }
        
    }
    all_transl_bits = all_transl_bits.filter(bit => (!(bit.SourceText == curr_bit.SourceText && bit.type == curr_bit.type)));
}

console.log(duplicates.length)
duplicates = JSON.stringify(duplicates, null, 2);
var output_path = path.join(__dirname, "../../flavour/Malaysia/inventory/no_match_duplicates_qr_arg.json");
fs.writeFile(output_path, duplicates, function (err, result) {
    if (err) console.log('error', err);
});