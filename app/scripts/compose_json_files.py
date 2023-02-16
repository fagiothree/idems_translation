import json
import os
import sys
from pathlib import Path


def main():
    in_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    split_groups = sys.argv[3]

    core_groups = [
        ('data_list', ['campaign_rows', 'campaign_schedule', 'campaign_rows_debug']),
        ('global', []),
        ('template', []),
        ('tour', []),
    ]
    
    compose(in_dir, out_dir, core_groups, split_groups)

def compose(in_dir, out_dir, core_groups, split_groups):

    split_groups = split_groups.split()

    all_contents = []

    #loop through all files in groups and join into a single list
    for (name, sub_dirs) in core_groups:
        contents = create_list(in_dir, name, sub_dirs, split_groups, out_dir)
        all_contents += contents

    #export the main list to JSON
    write_json(out_dir, "main", all_contents)

def create_list(in_dir, group_name, subfolders, split_groups, out_dir):
    input_list = accumulate_json_files(in_dir / group_name)

    for folder in subfolders:
        if (folder in split_groups):
            #if this is one of specified files then we don't want to add to the main list, we want to just export it as its own JSON
            split_output = accumulate_json_files(in_dir / group_name / folder)
            write_json(out_dir, folder, split_output)
        else:
            input_list += accumulate_json_files(in_dir / group_name / folder)

    return input_list

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
