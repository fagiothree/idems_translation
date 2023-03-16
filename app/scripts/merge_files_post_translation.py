import json
import os
import subprocess
import sys
from pathlib import Path


def main():
    config_path = Path(sys.argv[1])

    with open(config_path) as config_file:
        data = json.load(config_file)

        split_groups = data['SplitGroups']
        post_translation = data['PostTranslation']
        post_translation_jsons = data['PostTranslationJSONs']
        final_dictionaries = data['FinalDictionaries']

    # Loop through the custom groups that we sent to the translators
    for group_info in split_groups:
        foldername = group_info[1]
        folderpath = os.path.join(post_translation, foldername)

        # For each of these groups loop through the language folders that we got back
        for folder in os.listdir(folderpath):
            full_lang_path = os.path.join(folderpath, folder)
            lang_name = os.path.basename(folder)

            # check we have a folder ready to store a converted JSON version
            if not os.path.exists(post_translation_jsons):
                os.makedirs(post_translation_jsons)

            # For all the non-english files, create a destination folder to store a converted JSON version
            if lang_name != "en":
                dest_lang_path = os.path.join(post_translation_jsons, lang_name)
                if not os.path.exists(dest_lang_path):
                    os.makedirs(dest_lang_path)

                # For all individual files, convert to JSON and send to desired destination folder
                for file in os.listdir(full_lang_path):
                    file_name_without_ext = os.path.splitext(file)[0]
                    json_file = os.path.join(dest_lang_path, file_name_without_ext + ".json")
                    subprocess.run(["node", "./common_tools/index.js", "convert", os.path.join(full_lang_path, file), json_file], check=True)

    # check we have a folder ready to store the dictionaries
    if not os.path.exists(final_dictionaries):
        os.makedirs(final_dictionaries)

    # Loop through all languages to merge into a single JSON dictionary
    for file in os.listdir(post_translation_jsons):
        dictionary_name = file + "_dictionary"
        subprocess.run(["node", "./common_tools/index.js", "concatenate_json", os.path.join(post_translation_jsons, file), final_dictionaries, dictionary_name], check=True)


if __name__ == '__main__':
    main()
