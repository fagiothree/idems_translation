$ConfigObject = Get-Content "C:/Users/edmun/Code/idems_translation-1/app/config_files/settings.json" | ConvertFrom-Json
$CoreFiles = $ConfigObject.CoreFiles
$ComposeResult = $ConfigObject.ComposeResult
$SplitGroups = $ConfigObject.SplitGroups
$ExtractResult = $ConfigObject.ExtractResult
$ReadyForTranslation = $ConfigObject.ReadyForTranslation

python C:/Users/edmun/Code/idems_translation-1/app/scripts/compose_json_files.py $CoreFiles $ComposeResult $SplitGroups
python C:/Users/edmun/Code/idems_translation-1/app/scripts/extract_texts_script.py $ComposeResult $ExtractResult

$files = Get-ChildItem $ExtractResult
foreach ($f in $files){
    $name = [System.IO.Path]::GetFileNameWithoutExtension($f)
    $filepath = $ExtractResult + "/" + $f
    #create pot file
    $POT_file = $ReadyForTranslation + "/" + $name + ".pot"
    node ./common_tools/index.js convert $filepath $POT_file   
}

