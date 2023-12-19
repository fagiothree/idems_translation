# Chatbot translation tools

## Getting started

Install latest Long-Term Support (LTS) release of Node.js.

Install project dependencies.

```
npm install
```

## Running the scripts

### has\_any\_words\_check

Identify and fix possible errors in 'has\_any\_words' arguments.

```
node index has_any_words_check <rapidpro-json-file> <output-dir>
```

### overall\_integrity\_check

Look for errors in arguments and in the link between QR and Arguments.

```
node index overall_integrity_check <rapidpro-json-file> <output-dir>
```

### extract

Extract English-language strings from RapidPro flows, for translation.

```
node index extract <rapidpro-json-file> <output-dir>
```

### localize

Merge translated strings back into original flow as a localization.

```
node index localize <input-rapidpro-flow-file> <translated-strings-file> <language-code> <output-name> <output-dir>
```

### fix\_arg\_qr\_translation

Look for errors in the link between QR and Arguments that have been introduced during translation and apply an auto-fix.

```
node index fix_arg_qr_translation <rapidpro-json-file> <output-dir>
```

### move\_quick\_replies

Move quick replies to message text.

```
node index move_quick_replies <input-rapidpro-flow-file> <select_phrases> <output_name> <output-dir> <add_selectors> <qr_limit> <special_words>
```

- `add_selectors` is either "yes" or "no", depending on whether you want to add the numerical quick replies back in. Example input: "yes".
- `qr_limit` is an integer. A limit on the number of quick replies you want to add back in. If we are above the limit the `add_selectors` behaviour will be ignored and the quick replies will not be added back in.
- `special_words` is a path to JSON file which has a list of words which will be reinstated as full quick replies as opposed to numbers. The words should be organised by language, an example of the file can be found in `test/Input/special_words.json`. This file can be reviewed for info but should not be modified as it is part of the test script.

### reformat\_quick\_replies

Reformat quick replies.

```
node index reformat_quick_replies <input-rapidpro-flow-file> <select_phrases> <output_name> <output-dir> <count_threshold> <length_threshold> <qr_limit> <special_words>
```

- `count_threshold` and `length_threshold` are integers. If the count of quick_replies is greater than `count_threshold` or the longest quick reply is greater than `length_threshold`, then the quick replies will be replaced with numerical prompts.
- `qr_limit` is an integer. A limit on the number of quick replies you may want to add back in after they have been replaced with numerical prompts. If `count_threshold` and `qr_limit` are exceeded, the node message will be replaced with numerical prompts but those prompts will not be added as quick replies.
- `special_words` is a path to a JSON file which has a list of words which will be reinstated as full quick replies as opposed to numbers. The words should be organised by language, an example of the file can be found in `test/Input/special_words.json`. This file can be reviewed for info but should not be modified as it is part of the test script.

### convert\_qr\_to\_html

Convert Quick Replies to HTML in message text.

```
node index convert_qr_to_html <input-rapidpro-flow-file> <output_name> <output-dir>
```

Overall process visualised in flowchart linked below
https://docs.google.com/drawings/d/1i-64dAkcYqkLWNJmCpl7no6mQqFD3DJ1vI1lnKqd12U/edit?usp=sharing

## Running tests

```
npm test
```
