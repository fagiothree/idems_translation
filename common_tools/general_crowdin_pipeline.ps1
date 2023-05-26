
$flows = "..\..\parenttext-version-2\parenttext_modules.json"
$output_folder =  "..\..\parenttext-version-2\temp\temp_transl"
$strings_to_exclude = "..\..\parenttext-deployment\parenttext-international-repo\edits\exeptions_not_translate.json"
$pot_file_name = "modules_teen"

# extract strings from flows 
node ..\chatbot\index.js extract $flows $output_folder

#remove excluded strings
$eng_strings = $output_folder + "\step_3.json"
$eng_strings_filtered = $output_folder + "\step_3_filtered.json"
node exclude_strings.js $eng_strings $strings_to_exclude  $eng_strings_filtered

$eng_strings = $eng_strings_filtered

#create pot file
$POT_file = $output_folder + "\" + $pot_file_name + ".pot"
node index.js convert $eng_strings $POT_file






