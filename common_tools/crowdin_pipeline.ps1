$lang = "fil"
$3lang = "fil"
$2code = "SA"
$flavour = "south-africa"


############# create deployment versions of flows
# create international deployment version (all ab tests and edits on) and local flavour
Set-Location "C:\Users\fagio\Documents\parenttext-deployment"
.\deployment_pipeline.ps1
$local_pipeline = ".\" + $2code +"_deployment_pipeline.ps1"
Invoke-Expression $local_pipeline
################



Set-Location "C:\Users\fagio\Documents\idems_translation\common_tools"
# extract strings from international flows 
node ..\chatbot\index.js extract "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\temp\plh-international-flavour_expire_ABtesting.json" "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\temp\temp_transl"

#remove excluded strings from international
$intern_eng = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\temp\temp_transl\step_3.json"
$intern_eng_filtered = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\temp\temp_transl\international_filtered.json"
node exclude_strings.js $intern_eng "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\edits\exeptions_not_translate.json"  $intern_eng_filtered

$intern_eng = $intern_eng_filtered

#create international pot file
$POT_intern_file = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\temp\temp_transl\messages.pot"
node index.js convert $intern_eng $POT_intern_file

# extract strings from local flows 
node ..\chatbot\index.js extract ("C:\Users\fagio\Documents\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\" + $2code + "-plh-international-flavour_expire_ABtesting.json") ("C:\Users\fagio\Documents\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\")

#remove excluded strings from local flavour
$flavour_eng = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\step_3.json"
$flavour_eng_filtered = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\" +$flavour +"_filtered.json"
node exclude_strings.js $flavour_eng "C:\Users\fagio\Documents\parenttext-deployment\parenttext-international-repo\edits\exeptions_not_translate.json"  $flavour_eng_filtered

$flavour_eng = $flavour_eng_filtered

# identify strings local to a flavour and create POT file
$local_eng = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\" +$flavour +"_local.json"
node .\find_strings_local_to_flavour.js $intern_eng $flavour_eng $local_eng
$POT_local_file = "C:\Users\fagio\Documents\parenttext-deployment\parenttext-"+ $flavour +"-repo\temp\temp_transl\" +$flavour +"_additional_messages.pot"
node index.js convert $local_eng $POT_local_file




<#
#### manually create translated PO files #### (TO BE UPDATED)
# use translation dictionary to translate extracted json and convert it into po file
$translation_dict = "C:\Users\fagio\Documents\parentText-Malaysia-translation\" + $3lang + ".json"
$transl_folder = "C:\Users\fagio\Documents\parenttext-deployment\plh-digital-translation-repo\translated_json\international\"+ $lang +"\"

node .\translate_json_from_json_dict.js  $intern_eng $translation_dict $transl_folder

$transl_file = $transl_folder + "translated.json"
$PO_path = "C:\Users\fagio\Documents\parenttext-deployment\plh-digital-translation-repo\PO\"
$PO_transl_file = $PO_path + $lang +"_messages.po"


node index.js convert $transl_file $PO_transl_file

# translate the additional bits from the transl dict and create the po file
$local_transl_folder = "C:\Users\fagio\Documents\parenttext-deployment\plh-digital-translation-repo\translated_json\" +$flavour +"\"+ $lang +"\"
node .\translate_json_from_json_dict.js $local_eng $translation_dict $local_transl_folder

$local_transl_file = $local_transl_folder + "translated.json"
$local_PO_transl_file = $PO_path + $lang + "_" +$flavour +"_additional_messages.po"

node index.js convert $local_transl_file $local_PO_transl_file


######################
#>




