$ConfigPath = "C:/Users/edmun/Code/idems_translation-1/app/config_files/ParentingAppSettings.json"
$ConfigObject = Get-Content $ConfigPath | ConvertFrom-Json
$SplitGroups = $ConfigObject.SplitGroups
$PostTranslation = $ConfigObject.PostTranslation
$PostTranslationJSONs = $ConfigObject.PostTranslationJSONs
$FinalDictionaries = $ConfigObject.FinalDictionaries


#loop through the custom groups that we sent to the translators
foreach ($GroupInfo in $SplitGroups){
    $foldername = $GroupInfo[1]
    $folderpath = $PostTranslation + "/" + $foldername

    #for each of these groups loop through the language folders that we got back
    foreach($folder in Get-ChildItem -Path $folderpath -Directory){
        $full_lang_path = $folder.FullName
        $lang_name = $folder.name

        #for all the non-english files, create a destination folder to store a converted JSON version
        if($lang_name -ne "en"){
            $dest_lang_path = $PostTranslationJSONs + "/" + $lang_name
            $test = Test-Path $dest_lang_path
            if (!$test) {
                New-Item $dest_lang_path -ItemType Directory
            }

            #for all individual files, convert to JSON and send to desired destination folder
            foreach($file in Get-ChildItem -Path $full_lang_path){                
                $JSON_file = $dest_lang_path + "/" + $file.name + ".json"
                node ./common_tools/index.js convert $file.FullName $JSON_file  
                  
            }
        }
    }
}

#loop through all languages to merge into a single JSON dictionar
foreach ($file in Get-ChildItem -Path $PostTranslationJSONs -Directory){
    $dictionary_name = $file.name + "_dictionary"
    node ./common_tools/index.js concatenate_json $file.FullName $FinalDictionaries $dictionary_name 
}



