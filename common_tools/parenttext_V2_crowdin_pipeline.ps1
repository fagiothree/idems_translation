
$flow_type = "parenttext_homeactivitycheckin"### "parenttext_homeactivitycheckin" "parenttext_ltp_act_teen" #""parenttext_modules""parenttext_goalcheckin"
$crowdin_file_name = "home_activity_checkin_teen" ##"ltp_activities_teen" "modules_teen" "goal_checkins"

############# create deployment versions of flows
# create international deployment version (all ab tests and edits on) and local flavour

$source_file_name = $flow_type
$flows =   $source_file_name +".json"
$SPREADSHEET_ID_ab = '1i_oqiJYkeoMsYdeFOcKlvvjnNCEdQnZlsm17fgNvK0s'
$JSON_FILENAME = "..\parenttext-version-2\flows\" + $flows
$source_file_name = $source_file_name + "_ABtesting"
$output_path_2 = "parenttext-version-2\temp\" + $source_file_name + ".json"
$AB_log = "..\parenttext-version-2\temp\AB_warnings.log"
Set-Location "..\..\rapidpro_abtesting"
python main.py $JSON_FILENAME ("..\"  +$output_path_2) $SPREADSHEET_ID_ab --format google_sheets --logfile $AB_log 
Write-Output "added A/B tests and localisation"


################



Set-Location "..\idems_translation\common_tools"

$flows = "..\..\parenttext-version-2\temp\" + $flow_type + "_ABtesting.json"
$output_folder =  "..\..\parenttext-version-2\temp\temp_transl"
$strings_to_exclude = "..\..\parenttext-deployment\parenttext-international-repo\edits\exeptions_not_translate.json"
$pot_file_name = $crowdin_file_name

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