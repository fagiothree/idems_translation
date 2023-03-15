import compose_json_files
import extract_texts_script
import json
import os
from pathlib import Path
import sys
import subprocess

def main():
    config_path = Path(sys.argv[1])

    with open(config_path) as config_file:
        data = json.load(config_file)

        SplitGroups = data['SplitGroups']
        PostTranslation = data['PostTranslation']
        PostTranslationJSONs = data['PostTranslationJSONs']
        FinalDictionaries = data['FinalDictionaries']

    # Loop through the custom groups that we sent to the translators
    for GroupInfo in SplitGroups:
        foldername = GroupInfo[1]
        folderpath = os.path.join(PostTranslation, foldername)

        # For each of these groups loop through the language folders that we got back
        for folder in os.listdir(folderpath):
            full_lang_path = os.path.join(folderpath, folder)
            lang_name = os.path.basename(folder)

            # check we have a folder ready to store a converted JSON version
            if not os.path.exists(PostTranslationJSONs):
                os.makedirs(PostTranslationJSONs)

            # For all the non-english files, create a destination folder to store a converted JSON version
            if lang_name != "en":
                dest_lang_path = os.path.join(PostTranslationJSONs, lang_name)
                if not os.path.exists(dest_lang_path):
                    os.makedirs(dest_lang_path)

                # For all individual files, convert to JSON and send to desired destination folder
                for file in os.listdir(full_lang_path):
                    file_name_without_ext = os.path.splitext(file)[0]
                    json_file = os.path.join(dest_lang_path, file_name_without_ext + ".json")
                    subprocess.run(["node", "./common_tools/index.js", "convert", os.path.join(full_lang_path, file), json_file], check=True)

    # check we have a folder ready to store the dictionaries
    if not os.path.exists(FinalDictionaries):
        os.makedirs(FinalDictionaries)

    # Loop through all languages to merge into a single JSON dictionary
    for file in os.listdir(PostTranslationJSONs):
        dictionary_name = file + "_dictionary"
        subprocess.run(["node", "./common_tools/index.js", "concatenate_json", os.path.join(PostTranslationJSONs, file), FinalDictionaries, dictionary_name], check=True)
 

if __name__ == '__main__':
    main()