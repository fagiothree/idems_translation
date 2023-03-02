# Chatbot translation tools

## Getting started

Install latest Long-Term Support (LTS) release of Node.js.

Install project dependencies.
```
npm install
```

## Running the scripts

Run through RapidPro flows, identifying and fixing possible errors in 'has_any_words' arguments.
```
node index has_any_words_check <rapidpro-json-file> <output-dir>
```

Run through RapidPro flows, look for errors in arguments and in the link between QR and Arguments 
```
node index overall_integrity_check <rapidpro-json-file> <output-dir>
```

Extract English-language strings from RapidPro flows, for translation.
```
node index extract <rapidpro-json-file> <output-dir>
```

Merge translated strings back into original flow as a localization.
```
node index localize <input-rapidpro-flow-file> <translated-strings-file> <language-code> <output-name> <output-dir>
```

Run through RapidPro flows, look for errors in the link between QR and Arguments that have been introduced during translation and apply an auto-fix 
```
node index fix_arg_qr_translation <rapidpro-json-file> <output-dir>
```

Move quick replies to message text.
```
node index move_quick_replies <input-rapidpro-flow-file> <select_phrases> <output_name> <output-dir> <special_words> <add_selectors>

'add_selectors' expects a boolean, if you want to add the numerical quick replies back in, example input: true
'special_words' expects a list of words that will be re-inserted in full as part of the add_selectors process, example input "['back','close']"
```

Overall process visualised in flowchart linked below
https://docs.google.com/drawings/d/1i-64dAkcYqkLWNJmCpl7no6mQqFD3DJ1vI1lnKqd12U/edit?usp=sharing
```

## Running tests

```
npm test
```


