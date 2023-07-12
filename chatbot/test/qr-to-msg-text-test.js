const fs = require('fs');
const assert = require('assert');
const modify = require('../insert/modify_quick_replies.js');

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

describe('QR to Message Text', function() {
    it('runs the function on a sample input and check it matches the ideal output file', function() {
      
      // Run the function we are testing and store the output
      const [data1, debug, debug_lang] = modify.move_quick_replies_to_message_text(
        readInputFile("./test/Input/Before_qr_to_msg_text.json"), readInputFile("./test/Input/select_phrases.json"), "yes", readInputFile("./test/Input/special_words.json")
      );      
      
        // Load the sample JSON file
      const data2 = readInputFile("./test/Output/After_qr_to_msg_text.json");
      
      // Compare the two objects
      assert.deepStrictEqual(data1, data2);
    });
  });