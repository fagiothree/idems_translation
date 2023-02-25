$ConfigPath = "app/config_files/ParentingAppSettings.json"
$ConfigObject = Get-Content $ConfigPath | ConvertFrom-Json
$SplitGroups = $ConfigObject.SplitGroups
$ExtractResult = $ConfigObject.ExtractResult
$ReadyForTranslation = $ConfigObject.ReadyForTranslation

python app/scripts/compose_json_files.py $ConfigPath
python app/scripts/extract_texts_script.py $ConfigPath


foreach ($GroupInfo in $SplitGroups){
    $name = $GroupInfo[0]
    $dest_path = $GroupInfo[1]
    $filepath = $ExtractResult + "/" + $name + ".json"
    $foldername = $ReadyForTranslation + "/" + $dest_path + "/en"
    $test = Test-Path $foldername
    if (!$test) {
        New-Item $foldername -ItemType Directory
    }
    #create pot file
    $POT_file = $foldername + "/" + $name + ".pot"
    node ./common_tools/index.js convert $filepath $POT_file   
}

