import os
import json
import subprocess
from pathlib import Path
import sys

import compose_json_files
import extract_texts_script


def main():
    config_path = Path(sys.argv[1])

    with open(config_path) as config_file:
        data = json.load(config_file)

        extract_result = data['ExtractResult']
        ready_for_translation = data['ReadyForTranslation']
        split_groups_full = data['SplitGroups']

    compose_json_files.compose_files(config_path)
    extract_texts_script.extract_all_text(config_path)

    for group_info in split_groups_full:
        name = group_info[0]
        file_path = extract_result + '/' + name + '.json'

        #Check if destination folder information is provided
        if len(group_info) >= 2:
            dest_path = group_info[1]            
            folder_name = ready_for_translation + '/' + dest_path + '/en'
        else:
            folder_name = ready_for_translation + '/en'

        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        POT_file = folder_name + '/' + name + '.pot'

        subprocess.run(['node', './common_tools/index.js', 'convert', file_path, POT_file], check=True)


if __name__ == '__main__':
    
    main()
