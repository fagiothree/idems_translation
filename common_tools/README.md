# Common translation tools

## Getting started

Install latest Long-Term Support (LTS) release of Node.js.

Install project dependencies.
```
npm install
```

## Running the scripts

### Common tools

Identify messages that are mising a translation.
```
node index missing ".\test_files\current_translation_list.json" ".\test_files\translation_dictionary.json" ".\test_files\output"
```

???
```
node index match ".\test_files\output\missing_bits_to_translate.json" ".\test_files\translation_dictionary.json" ".\test_files\output"
```

???
```
node index add_restored ".\test_files\output\selected_best_matches.json" ".\test_files\translation_dictionary.json" ".\test_files\output"
```

#### Convert

Convert between JSON and PO file format.
```
node index convert <input_file> [output_file]
```

- `input_file` (mandatory). File that will be used as input. The file extension will be used to decide on the direction of the conversion i.e. JSON to PO, or PO to JSON.
- `output_file` (optional). File where the converted output will be saved. If omitted, the output will be printed on the console.

Examples:
```
node index convert example.json example.po
node index convert example.po example.json
node index convert example.json > example.po
node index convert example.json | less
```
