const fs = require('fs');
const assert = require('assert');
const modify = require('../insert/modify_quick_replies.js');

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

describe('QR to HTML Test', function() {
    it('runs the function on a sample input and check it matches the ideal output file', function() {
      
      // Run the function we are testing and store the output
      const [data1, debug, debug_lang] = modify.convert_qr_to_html(
        readInputFile("./test/Input/Before_qr_to_html.json")
      );      
      
        // Load the sample JSON file
      const data2 = readInputFile("./test/Output/After_qr_to_html.json");
      
      // Compare the two objects
      assert.deepStrictEqual(data1, data2);
    });
  });