# ParentApp-translation

## Running the scripts

The translation process involves 2 key stages.

 - Prepare the json files to be sent to the translators 
 - Merge the files that we receive back from the translators into a usable format

Each stage is completed with a specific master function as outlined below. However, both of these functions require a `config` file as an input. The config file contains the various file paths that are used in the process, and a number of lists which specify the particular folders to be considered. The two key lists which should be provided in the `config` file are the `CoreGroups` and `SplitGroups`.

### CoreGroups
`CoreGroups` is a list of where to look for json files that may need to be translated (given that we have provided a base file path as another argument in the config file). It allows a list within the list to be more specific about where to look. For example if we used:

`"CoreGroups": [["folder_A", ["sub_folder_1", "sub_folder_2"]],["folder_B", [""]]]`

Then the script would look for any `.json` files in `folder_A` and `folder_B`, as well as `.json` files in `sub_folder_1` and `sub_folder_2` which are within `folder_A`

### SplitGroups
`SplitGroups` is how we specify how the files are organised before they are sent off to the translators. We may wish to divide the text into specific chunks so they can be sent to specialised translators. An example of the `SplitGroups` list would be something like:

`"SplitGroups": [["main", "group_1"], ["sub_folder_1", "group_1"], ["sub_folder_2", "group_2"]]`

We always need a 'main' entry within `SplitGroups`, 'main' will contain all the text to be translated that is not covered by the other entries in `SplitGroups`. The script will go through all of the JSON files as collected in the core groups and extract the text that needs to be translated and store as a POT file. In `SplitGroups` the first entry in the list is the name of the file where all of the translated text is collected, the second entry in the list is the folder in which that file is stored. So the above entry would produce the following structure.

    group_1
        main.pot
        sub_folder_1.pot
    group_2
        sub_folder_2.pot

The actual functions are then as follows

### Prepare for translation

```
python app/scripts/prepare_for_translation.py <relative path to config_file.json>
```


### Merge files post translation

```
python app/scripts/merge_files_post_translation.py <relative path to config_file.json>
```


## Running the tests

```
python -m unittest scripts.tests
```
