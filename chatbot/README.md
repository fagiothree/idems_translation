# Chatbot translation tools

## Getting started

Install latest Long-Term Support (LTS) release of Node.js.

Install project dependencies.
```
npm install
```

## Running the scripts

Extract English-language strings from RapidPro flows, for translation.
```
node index extract <rapidpro-json-file> <output-dir>
```

Merge translated strings back into original flow as a localization.
```
node index localize <input-rapidpro-flow-file> <translated-strings-file> <language-code> <output-dir>
```

Move quick replies to message text.
```
node index move_quick_replies <input-rapidpro-flow-file> <output-dir>
```

## Running tests

```
npm test
```


