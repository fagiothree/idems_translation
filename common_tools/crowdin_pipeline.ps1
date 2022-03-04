$2code = "SA"
$flavour = "south-africa"


############# create deployment versions of flows
# create international deployment version (all ab tests and edits on) and local flavour
Set-Location "..\..\parenttext-deployment"
.\INTERNATIONAL_deployment.ps1
$local_pipeline = ".\" + $2code +"_deployment.ps1"
Invoke-Expression $local_pipeline
################



Set-Location "..\idems_translation\common_tools"
# extract strings from international flows 
node ..\chatbot\index.js extract "..\..\parenttext-deployment\parenttext-international-repo\temp\plh-international-flavour_expire_ABtesting.json" "..\..\parenttext-deployment\parenttext-international-repo\temp\temp_transl"

#remove excluded strings from international
$intern_eng = "..\..\parenttext-deployment\parenttext-international-repo\temp\temp_transl\step_3.json"
$intern_eng_filtered = "..\..\parenttext-deployment\parenttext-international-repo\temp\temp_transl\international_filtered.json"
node exclude_strings.js $intern_eng "..\..\parenttext-deployment\parenttext-international-repo\edits\exeptions_not_translate.json"  $intern_eng_filtered

$intern_eng = $intern_eng_filtered

#create international pot file
$POT_intern_file = "..\..\parenttext-deployment\parenttext-international-repo\temp\temp_transl\messages.pot"
node index.js convert $intern_eng $POT_intern_file

# extract strings from local flows 
node ..\chatbot\index.js extract ("..\..\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\" + $2code + "-plh-international-flavour_expire_ABtesting.json") ("..\..\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\")

#remove excluded strings from local flavour
$flavour_eng = "..\..\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\step_3.json"
$flavour_eng_filtered = "..\..\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\" +$flavour +"_filtered.json"
node exclude_strings.js $flavour_eng "..\..\parenttext-deployment\parenttext-international-repo\edits\exeptions_not_translate.json"  $flavour_eng_filtered

$flavour_eng = $flavour_eng_filtered

# identify strings local to a flavour and create POT file
$local_eng = "..\..\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\" +$flavour +"_local.json"
node .\find_strings_local_to_flavour.js $intern_eng $flavour_eng $local_eng
$POT_local_file = "..\..\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\" +$flavour +"_additional_messages.pot"
node index.js convert $local_eng $POT_local_file








