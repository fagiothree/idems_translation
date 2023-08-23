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
node index move_quick_replies <input-rapidpro-flow-file> <select_phrases> <output_name> <output-dir> <add_selectors> <qr_limit> <special_words>

'add_selectors' expects either "yes" or "no", if you want to add the numerical quick replies back in, example input: "yes"
'qr_limit' expects an integer input, it is a limit on the number of quick replies you want to add back in. So if we are above the limit the 'add_selectors' behaviour will be ignored and the quick replies will not be added back in. 
'special_words' expects a path to JSON which has a list of words which will be reinstated as full quick replies as opposed to numbers. The special_words should be organised by language, an example of the file can be found in `test/Input/special_words.json`. This file can be reviewed for info but should not be modified as it is part of the test script
```

Reformat quick replies
```
node index reformat_quick_replies <input-rapidpro-flow-file> <select_phrases> <output_name> <output-dir> <count_threshold> <length_threshold> <special_words>

'count_threshold' and 'length_threshold' expects integers input, 
if the count of quick_replies is above the count threshold or the longest quick_reply is above the length threshold then the quick_replies will be replaced with numerical prompts
'qr_limit' expects an integer input, it is a limit on the number of quick replies you may want to add back in after they have been replaced with numerical prompts. So if we are above the count threshold and above the qr_limit, the node message will be replaced with numerical prompts but those prompts will not be added as quick replies. 
'special_words' expects a path to JSON which has a list of words which will be reinstated as full quick replies as opposed to numbers. The special_words should be organised by language, an example of the file can be found in `test/Input/special_words.json`. This file can be reviewed for info but should not be modified as it is part of the test script
```

Overall process visualised in flowchart linked below
https://docs.google.com/drawings/d/1i-64dAkcYqkLWNJmCpl7no6mQqFD3DJ1vI1lnKqd12U/edit?usp=sharing
```

## Running tests

```
npm test
```


