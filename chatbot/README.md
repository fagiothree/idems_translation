# Chatbot translation tools

## Getting started

Install latest Long-Term Support (LTS) release of Node.js.

Install project dependencies.
```
npm install
```

## Running the scripts

To extract English-language strings from RapidPro flows, for translation.
```
node index extract <rapidpro-json-file> <output-dir>
```

To merge translated strings back into original flow as a localization.
```
node index localize <input-rapidpro-flow-file> <translated-strings-file> <language-code> <output-dir>
```

## Running tests

```
npm test
```


