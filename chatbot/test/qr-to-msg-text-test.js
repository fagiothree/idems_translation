const fs = require('fs');
const assert = require('assert');
const modify = require('../insert/add_quick_replies_to_msg_text_and_localization.js');

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

describe('Test of "QR to Message Text" function', function() {
    it('should run "move_quick_replies_to_message_text" on a sample input and check it matches the ideal output file', function() {
      
      // Run the function we are testing and store the output
      const [data1, debug, debug_lang] = modify.move_quick_replies_to_message_text(
        readInputFile("./test/Input/Before_qr_to_msg_text.json"), readInputFile("./test/Input/select_phrases.json"), readInputFile("./test/Input/special_words.json"), true
      );      
      
        // Load the sample JSON file
      const data2 = readInputFile("./test/Output/After_qr_to_msg_text.json");
      
      // Compare the two objects
      assert.deepStrictEqual(data1, data2);
    });
  });