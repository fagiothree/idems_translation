import json
import argparse


def map_entry(string, dictionary):
    if string in dictionary:
        return dictionary[string]
    else:
        print(f"Warning: '{string}' is not in the dictionary")
        return string


def main():
    parser = argparse.ArgumentParser(description='Apply FlowEdits/ABTests to a RapidPro JSON file.')
    parser.add_argument('dictionary', help='JSON file defining the translations.')
    parser.add_argument('input', help='JSON file defining the input to be translated.')
    parser.add_argument('output', help='JSON file to write the translated output to.')
    parser.add_argument('--separator', default="\n\n", help='For multi-part strings, the separator used during concatenation.')
    args = parser.parse_args()

    dictionary_data = json.load(open(args.dictionary, 'r', encoding='utf-8'))
    in_data = json.load(open(args.input, 'r', encoding='utf-8'))
    dictionary = {entry["SourceText"] : entry["text"] for entry in dictionary_data}

    for entry in in_data:
        for field in ["text", "title"]:
            out_text = map_entry(entry[field], dictionary)

            for key in sorted(entry.keys()):
                if key.startswith(field + "_part_"):
                    out_text += args.separator + map_entry(entry[key], dictionary)
                    entry.pop(key)

            entry[field] = out_text
    
    json.dump(in_data, open(args.output, 'w'), indent=4)


if __name__ == '__main__':
    main()
