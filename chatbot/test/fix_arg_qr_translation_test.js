const fs = require('fs');
const assert = require('assert');
const modify = require('../insert/fix_arg_qr_translation.js');

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

describe('Test of "Fixer Arg and QR after translation" function', function() {
    it('should fix the arguments of various nodes to ensure the logic of the english is consistent with the translation, runs the function on a sample input and check it matches the ideal output file', function() {
      
      // Run the function we are testing and store the output
      const [data1, debug_lang, languages] = modify.fix_arg_qr_translation(
        readInputFile("./test/Input/Before_fix_arg_qr_translation.json")
      );      
      
        // Load the sample JSON file
      const data2 = readInputFile("./test/Output/After_fix_arg_qr_translation.json");
      
      // Compare the two objects
      assert.deepStrictEqual(data1, data2);
    });
  });