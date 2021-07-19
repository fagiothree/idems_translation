const extract = require('./extract/extract_text_for_translation.js');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'extract') {
    const input_file = args[1];
    const output_dir = args[2];
    extract.index(input_file, output_dir);
} else {
    console.log(`Command not recognised, command=${command}`);
}
