import json
import os
import re           # for doing regex search
from pathlib import Path


def extract_texts():
    srcs = [
        'template',
        'global',
        'tour',
        'data_list',
    ]
    results_all = []

    for src in srcs:
        results = process_file(src)
        save_results(src, results)
        print_report(src, results)
        results_all += results

    # Result from all files
    print(f"Processing 'all'")
    print(f'Length: {len(results_all)}')
    save_results('all', dedupe(results_all))
    print_report('all', results_all)

def process_file(src):
    print(f"Processing '{src}'")

    input_file_path = Path(os.getcwd()) / 'input' / f'input_{src}.json'

    if not input_file_path.exists():
        print(f'File not found, file={input_file_path}')
        return []

    with open(input_file_path, 'r', encoding='utf-8') as input_file:
        contents = json.load(input_file)

    results = []

    for object in contents:
        rows = object.get('rows', [])
        process_rows(rows, results, src)

    print(f'Length: {len(results)}')

    return dedupe(remove_empty(results))

def process_rows(val, result, filename):
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

    for item in val:
        if filename == 'template' or filename == 'global':
            if not 'exclude_from_translation' in item or not bool(item.get('exclude_from_translation')) == True:
                item_value = item.get('value')
                value_type = str(item.get('type'))
                if not value_type in excluded_types:
                    if isinstance(item_value, str):
                        value_string = str(item_value).strip()
                        matched_expressions=[]
                        if filename =='template':
                            if item.get('_dynamicFields')!=None and item.get('_dynamicFields').get('value') != None:
                                for matched_expression in item.get('_dynamicFields').get('value'):
                                    if matched_expression.get('matchedExpression')!= None:
                                        matched_expressions.append(matched_expression.get('matchedExpression'))
                        elif filename =='global':
                            get_matched_text(value_string, matched_expressions)
                        add_to_result(value_string, matched_expressions, result, filename)
                    if isinstance(item_value, list):
                        i=-1
                        matched_expressions=[]
                        if item.get('_dynamicFields')!=None:
                            i=0
                            matched_expression_list= item.get('_dynamicFields').get('value')
                        for list_item in item_value:
                            if 'text:' in str(list_item):
                                begin_str = str(list_item).find('text:')+5
                                end_str = str(list_item).find('|', begin_str)
                                if end_str > 0:
                                    value_string=str(list_item[begin_str:end_str]).strip()
                                    #print(value_string)
                                else:
                                    value_string=str(list_item[begin_str:]).strip()
                                    #print(value_string)
                                if i>=0:
                                    if matched_expression_list.get(i) != None:
                                        for matched_expression in matched_expression_list.get(i):
                                            if matched_expression.get('matchedExpression')!= None:
                                                matched_expressions.append(matched_expression.get('matchedExpression'))
                                    i=i+1
                                add_to_result(value_string,matched_expressions, result, filename)
                if item.get('rows')!=None :
                    process_rows(item.get('rows'), result, filename)
        elif filename == 'data_list':
            if not 'exclude_from_translation' in item or not bool(item.get('exclude_from_translation')) == True:
                if item.get('_translatedFields') != None:
                    for elt in item.get('_translatedFields'):
                        value_string = str(item.get('_translatedFields').get(str(elt)).get('eng')).strip()
                        #print(value_string, 'Ok', elt)
                        matched_expressions = []
                        get_matched_text(value_string, matched_expressions)
                        result.append(add_to_result(value_string, matched_expressions, result, filename))
        else:
            if not 'exclude_from_translation' in item or not bool(item.get('exclude_from_translation')) == True:
                value_type = str(item.get('type'))
                if 'title' in item and not value_type in excluded_types:
                    item_value_title = item.get('title')
                    value_title_string = str(item_value_title).strip()
                    matched_expressions=[]
                    get_matched_text(value_title_string, matched_expressions)
                    result.append(add_to_result(value_title_string, matched_expressions, result, filename))
                if 'message_text' in item and not value_type in excluded_types:
                    item_value_message = item.get('message_text')
                    value_message_string = str(item_value_message).strip()
                    matched_expressions=[]
                    get_matched_text(value_message_string, matched_expressions)
                    result.append(add_to_result(value_message_string, matched_expressions, result, filename))

def add_to_result(value_string, matched_expressions, result, filename):
    if is_valid_value_string(value_string):
        result_item = {}
        result_item['SourceText'] = value_string
        result_item['text'] = value_string
        result_item['type'] = filename
        if len(matched_expressions) == 1:
            result_item['note'] = 'The string ' + \
               matched_expressions[0] \
                + ' should not be translated.'
        if len(matched_expressions) >1:
            note_text = 'The following strings should not be translated: '
            for matched_expression in matched_expressions:
                note_text = note_text+'\n     '+matched_expression

            result_item['note'] = note_text
        result.append(result_item)

def is_valid_value_string(value_string):
    ignore_start = ('https', '@', 'plh_', '+@', '!@', '!!@')
    ignore_end = ('.json', '.png', '.svg', '.mp3', '.mp4')

    return not value_string.endswith(ignore_end) and \
        not value_string == 'true' and \
        not value_string == 'false' and \
        value_string != 'None' and \
        value_string != "" and \
        not value_string.isnumeric() and \
        not (
            (not value_string.isalpha()) and \
            len(re.findall(r"\w", value_string)) == len(value_string)
        ) and \
        not (
            ("@" in value_string) and \
            (" " not in value_string)
        ) and \
        not (
            value_string.startswith(ignore_start) and \
            (" " not in value_string)
        )

def get_matched_text(value_string, matched_expressions):
    if str(value_string).count('@') > 0:
        for txt in value_string.split():
            if '@' in txt:
                matched_expressions.append(txt)

def remove_empty(results):
    tmp = [i for i in results if i]
    print(f'Length after removing empties: {len(results)}')
    return tmp

def dedupe(results):
    tmp = [i for n, i in enumerate(results) if i not in results[n + 1:]]
    print(f'Length after removing duplicates: {len(results)}')
    return tmp

def save_results(src, results):
    out_dir = Path(os.getcwd()) / 'output'
    out_dir.mkdir(parents=True, exist_ok=True)
    file_name = f'output_{src}.json'
    results_file_path = out_dir / file_name
    with open(results_file_path, 'w', encoding='utf-8') as results_file:
        json.dump(results, results_file, ensure_ascii=False, indent=2)

def print_report(src, results):
    texts = [str(d.get('text', '')) for d in results]
    print(f'Number of characters for translation in output_{src}.json: ', sum(len(i) for i in texts))
    print(f'Number of words for translation in output_{src}.json: ', sum(len(i.split()) for i in texts))
    print('----------------------------------------------------------')


if __name__ == '__main__':
    extract_texts()
