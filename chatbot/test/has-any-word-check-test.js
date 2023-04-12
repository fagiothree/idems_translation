const fs = require('fs');
const assert = require('assert');
const modify = require('../insert/check_has_any_word_args.js');

function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

describe('Test of "Has_any_word_check" function', function() {
    it('This function is used to look at arguments on the wait for response nodes, if we have duplication within the arguments then it may cause the flow to run incorrectly, this test runs the function on a sample input and check it matches the ideal output file', function() {
      
      // Run the function we are testing and store the output
      const [data1, fixlog] = modify.fix_has_any_words(
        readInputFile("./test/Input/Before_has_any_word_check.json")
      );      
      
        // Load the sample JSON file
      const data2 = readInputFile("./test/Output/After_has_any_word_check.json");
      
      // Compare the two objects
      assert.deepStrictEqual(data1, data2);
    });
  });