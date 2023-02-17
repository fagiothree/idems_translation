import json
import os
import sys
from pathlib import Path


def main():
    ConfigPath = Path(sys.argv[1])

    with open(ConfigPath) as config_file:
        data = json.load(config_file)

        in_dir = Path(data['CoreFiles'])
        out_dir = Path(data['ComposeResult'])
        out_dir.mkdir(parents=True, exist_ok=True)
        core_groups = data['CoreGroups']
        split_groups_full = data['SplitGroups']
        split_groups = [row[0] for row in split_groups_full]
    
    compose(in_dir, out_dir, core_groups, split_groups)

def compose(in_dir, out_dir, core_groups, split_groups):

    #We want to separate the 'main' content from the 'split_groups', set up a dictionary here to store the different content
    contents = {}
    for (folder) in split_groups:
        contents[folder] = []

    #loop through all files in groups to collect the contents into the correct group
    for (name, sub_dirs) in core_groups:
        contents = create_list(in_dir, name, sub_dirs, split_groups, contents)
        
    #export the lists to JSON
    for (folder) in split_groups:
        write_json(out_dir, folder, contents[folder])

def create_list(in_dir, group_name, subfolders, split_groups, contents):
    contents["main"] += accumulate_json_files(in_dir / group_name)

    for folder in subfolders:
        if (folder in split_groups):
            #if this is one of specified files then we don't want to add to the main list, we want to add it to the correct list
            contents[folder] += accumulate_json_files(in_dir / group_name / folder)
        else:
            contents["main"] += accumulate_json_files(in_dir / group_name / folder)

    return contents

def accumulate_json_files(dir_path):
    acc = []

    if not dir_path.exists():
        return acc

    for file_name in os.listdir(dir_path):
        file_path = dir_path / file_name
        if file_path.is_file():
            acc.append(read_json(file_path))

    return acc

def read_json(file_path):
    with open(file_path, encoding='utf-8') as json_file:
        return json.load(json_file)

def write_json(out_dir, group_name, contents):
    file_path = out_dir / f'{group_name}.json'
    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(contents, json_file, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
