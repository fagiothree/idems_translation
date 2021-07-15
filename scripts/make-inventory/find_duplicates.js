var fs = require('fs');
var path = require("path");

const input_path = path.join(__dirname, "../../flavour/Philippines/input/OFFICIAL_philippines_tranlsation.json");
const json_string = fs.readFileSync(input_path).toString();
let all_transl_bits = JSON.parse(json_string);

let  duplicates = [];

while(all_transl_bits.length>0){
    let curr_bit = all_transl_bits[0];
    let matching_bits = all_transl_bits.filter(bit => (bit.SourceText == curr_bit.SourceText && bit.type == curr_bit.type));
    if (matching_bits.length>1){
        let dupl = {};
        dupl.SourceText = curr_bit.SourceText;
        dupl.type = curr_bit.type;
        dupl.transl = [];
        matching_bits.forEach(bit => {
            dupl.transl.push(bit.text);
        });
        duplicates.push(dupl)
    }
    all_transl_bits = all_transl_bits.filter(bit => (!(bit.SourceText == curr_bit.SourceText && bit.type == curr_bit.type)));
}


duplicates = JSON.stringify(duplicates, null, 2);
var output_path = path.join(__dirname, "../../flavour/Philippines/inventory/duplicates.json");
fs.writeFile(output_path, duplicates, function (err, result) {
    if (err) console.log('error', err);
});