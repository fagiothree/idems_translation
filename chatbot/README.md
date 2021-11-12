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

Run through RapidPro flows, log the connections between quick replies and arguments.
```
node index integrity_check <rapidpro-json-file> <output-dir>
```

Extract English-language strings from RapidPro flows, for translation.
```
node index extract <rapidpro-json-file> <output-dir>
```

Merge translated strings back into original flow as a localization.
```
node index localize <input-rapidpro-flow-file> <translated-strings-file> <language-code> <output-name> <output-dir>
```

Move quick replies to message text.
```
node index move_quick_replies <input-rapidpro-flow-file> <select_phrases> <output_name> <output-dir>
```

Overall process visualised in flowchart linked below
https://docs.google.com/drawings/d/1i-64dAkcYqkLWNJmCpl7no6mQqFD3DJ1vI1lnKqd12U/edit?usp=sharing
```

## Running tests

```
npm test
```


