$InputFile = "C:/Users/edmun/Google Drive - EEM Engineering Ltd/Translation Checking/SA 13.12.21/7 - PLH_with_afr_sot_tsn_xho_zul.json"
$OutputDir = "C:/Users/edmun/Google Drive - EEM Engineering Ltd/Translation Checking/SA 13.12.21"
$JSON9 = "9 - Modified JSON Following has_any_words_check"
$JSON9Path = $OutputDir + '/' + $JSON9 + '.json'
$LOG10 = "10 - Log of changes after has_any_words_check"
$JSON11 = "11 - Modified JSON Following fix_arg_qr_translation"
$JSON11Path = $OutputDir + '/' + $JSON11 + '.json'
$LOG12 = "12 - Log of changes after fix_arg_qr_translation"
$LOG13 = "13 - Log of erros in file found using overall_integrity_check"
    
Node index has_any_words_check $InputFile $OutputDir $JSON9 $LOG10
Node index fix_arg_qr_translation $JSON9Path $OutputDir $JSON11 $LOG12
Node index overall_integrity_check $JSON11Path $OutputDir $LOG13
