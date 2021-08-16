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
