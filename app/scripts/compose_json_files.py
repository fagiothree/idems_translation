import json
import os
import sys
from pathlib import Path


def main():
    in_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    groups = [
        ('data_list', ['campaign_rows']),
        ('global', []),
        ('template', []),
        ('tour', []),
    ]

    for (name, sub_dirs) in groups:
        contents = create_list(in_dir, name, sub_dirs)
        write_json(out_dir, name, contents)

def create_list(in_dir, group_name, subfolders):
    input_list = accumulate_json_files(in_dir / group_name)

    for folder in subfolders:
        input_list += accumulate_json_files(in_dir / group_name / folder)

    return input_list

def accumulate_json_files(dir_path):
    acc = []

    for file_name in os.listdir(dir_path):
        file_path = dir_path / file_name
        if file_path.is_file():
            acc.append(read_json(file_path))

    return acc

def read_json(file_path):
    with open(file_path, encoding='utf-8') as json_file:
        return json.load(json_file)

def write_json(out_dir, group_name, contents):
    file_path = out_dir / f'input_{group_name}.json'
    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(contents, json_file, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
