import json
import os
import sys
import re           # for doing regex search
from pathlib import Path


def extract_all_text(config_path):
    config_path = Path(sys.argv[1])
    with open(config_path) as config_file:
        data = json.load(config_file)

        in_dir = Path(data['ComposeResult'])
        out_dir = Path(data['ExtractResult'])

    extract_texts(in_dir, out_dir)

def extract_texts(in_dir, out_dir):
    #get a list of all the files in our input directory
    srcs = os.listdir(in_dir)

    for src in srcs:
        results = process_file(src, in_dir)
        save_results(src, results, out_dir)
        print_report(src, results)

def process_file(src, in_dir):
    print(f"Processing '{src}'")

    results = []

    input_file_path = in_dir / src

    if not input_file_path.exists():
        print(f'File not found, file={input_file_path}')
        return []

    with open(input_file_path, 'r', encoding='utf-8') as input_file:
        contents = json.load(input_file)

    #loop through all the flows in our file
    for object in contents:
        flow_type = object.get('flow_type')
        rows = object.get('rows', [])
        process_rows(rows, results, flow_type)

    print(f'Length: {len(results)}')

    return dedupe(remove_empty(results))

def process_rows(rows, results, flow_type):

    excluded_types = (
        'nested_properties',
        'template',
        'image',
        'audio',
        'video',
        'animated_section',
        'display_group',
        'lottie_animation'
    )

    for item in rows:        
        if not 'exclude_from_translation' in item or not bool(item.get('exclude_from_translation')) == True:
            match flow_type:

                case 'template' | 'global':
                    item_value = item.get('value')
                    value_type = str(item.get('type'))
                    if not value_type in excluded_types:
                        if isinstance(item_value, str):
                            value_string = str(item_value).strip()
                            matched_expressions = get_matched_text(item, value_string, flow_type)
                            add_to_result(value_string, matched_expressions, results, flow_type)
                        if isinstance(item_value, list):
                            for i in range(0, len(item_value)):
                                if 'text:' in str(item_value[i]):
                                    begin_str = str(item_value[i]).find('text:')+5
                                    end_str = str(item_value[i]).find('|', begin_str)
                                    if end_str > 0:
                                        value_string=str(item_value[i][begin_str:end_str]).strip()
                                    else:
                                        value_string=str(item_value[i][begin_str:]).strip()
                                    matched_expressions = get_matched_text(item, value_string, flow_type, "list", i)
                                    add_to_result(value_string, matched_expressions, results, flow_type)
                    if item.get('rows')!=None:
                        process_rows(item.get('rows'), results, flow_type)


                case 'tour':
                    if 'title' in item:
                        value_string = str(item.get('title')).strip()
                        matched_expressions = get_matched_text(item, value_string, flow_type)
                        add_to_result(value_string, matched_expressions, results, flow_type)
                    if 'message_text' in item:
                        value_string = str(item.get('message_text')).strip()
                        matched_expressions = get_matched_text(item, value_string, flow_type)
                        add_to_result(value_string, matched_expressions, results, flow_type)

                case 'data_list':
                    if item.get('_translatedFields') != None:
                        for elt in item.get('_translatedFields'):
                            value_string = str(item.get('_translatedFields').get(str(elt)).get('eng')).strip()
                            matched_expressions = get_matched_text(item, value_string, flow_type)
                            add_to_result(value_string, matched_expressions, results, flow_type)
            

def add_to_result(value_string, matched_expressions, results, flow_type):
    
    if is_valid_value_string(value_string):
        result_item = {}
        result_item['SourceText'] = value_string
        result_item['text'] = value_string
        result_item['type'] = flow_type
        if len(matched_expressions) == 1:
            result_item['note'] = 'The string ' + \
               matched_expressions[0] \
                + ' should not be translated.'
        if len(matched_expressions) >1:
            note_text = 'The following strings should not be translated: '
            for matched_expression in matched_expressions:
                note_text = note_text+'\n     '+matched_expression

            result_item['note'] = note_text
        results.append(result_item)

def is_valid_value_string(value_string):
    ignore_start = ('https', '@', 'plh_', '+@', '!@', '!!@')
    ignore_end = ('.json', '.png', '.svg', '.mp3', '.mp4')

    result = False

    #split the string into a number of words. If we find any readable words in the string (based on criteria below) then the string is valid

    value_strings = value_string.split()

    for word in value_strings:

        if not word.endswith(ignore_end) and \
        not word.startswith(ignore_start) and \
        not word == 'true' and \
        not word == 'false' and \
        word != 'None' and \
        word != "" and \
        not word.isnumeric() and \
        not (
            (not value_string.isalpha()) and \
            len(re.findall(r"\w", value_string)) == len(value_string)
        ) and \
        not "@" in word:
            result = True 

    return result        

def get_matched_text(item, value_string, flow_type, type = "string", i = 0):
    matched_expressions = []
    if type == "string":
        if flow_type =='template':                                
            if item.get('_dynamicFields')!=None and item.get('_dynamicFields').get('value') != None:
                for values in item.get('_dynamicFields').get('value'):
                    if values.get('matchedExpression')!= None:
                        matched_expressions.append(values.get('matchedExpression'))
        elif str(value_string).count('@') > 0:
            for txt in value_string.split():
                if '@' in txt:
                    matched_expressions.append(txt)
    if type == "list":
        if item.get('_dynamicFields')!=None:
            matched_expression_list= item.get('_dynamicFields').get('value')
            if matched_expression_list.get(i) != None:
                for values in matched_expression_list.get(i):
                    if values.get('matchedExpression')!= None:
                        matched_expressions.append(values.get('matchedExpression'))
    return matched_expressions

def remove_empty(results):
    tmp = [i for i in results if i]
    print(f'Length after removing empties: {len(results)}')
    return tmp

def dedupe(results):
    tmp = [i for n, i in enumerate(results) if i not in results[n + 1:]]
    print(f'Length after removing duplicates: {len(results)}')
    return tmp

def save_results(src, results, out_dir):
    out_dir = out_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    file_name = src
    results_file_path = out_dir / file_name
    with open(results_file_path, 'w', encoding='utf-8') as results_file:
        json.dump(results, results_file, ensure_ascii=False, indent=2)

def print_report(src, results):
    texts = [str(d.get('text', '')) for d in results]
    print(f'Number of characters for translation in output_{src}.json: ', sum(len(i) for i in texts))
    print(f'Number of words for translation in output_{src}.json: ', sum(len(i.split()) for i in texts))
    print('----------------------------------------------------------')

if __name__ == "__main__":
    extract_texts(Path("./app/test_files_in"), Path("./app/test_files_out"))


