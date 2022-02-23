// This script is used to fix translation erros in the JSON file
// It is looking for where there is a problem between the link between Quick Replies and arguments
// We compare the QR:Arg links in english to those in the translation
// If there is a mismatch we will use the English to find the correct argument and fill using the translated quick replies

const utility = require('./translation_functions.js');
const fs = require('fs'); 

// Code for running local tests on function - leave in place
//let filePath = "C:/Users/edmun/Google Drive - EEM Engineering Ltd/Translation Checking/SA 13.12.21/7 - PLH_with_afr_sot_tsn_xho_zul.json"
//let obj = JSON.parse(fs.readFileSync(filePath).toString());
//const [a, b] = fix_arg_qr_translation(obj);

function fix_arg_qr_translation(object) {
    
    // Find out if there are languages in this file
    let languages = utility.findlanguages(object);

    // Set up variables that are used in the log files
    TotalFlowCount = 0
    TotalProblemFlowsENG = 0
    TotalQRNodes = 0
    TotalProblemNodesENG = 0            
    NonTranslatedQR = {};
    NonTranslatedArguments = {};
    TotalProblemFlowsLANG = {};
    TotalProblemNodesLANG = {};
    FaultyFix = {};
    FailedFix = {}
    for (const lang of languages){
        NonTranslatedQR[lang] = 0;
        NonTranslatedArguments[lang] = 0;
        TotalProblemFlowsLANG[lang] = 0
        TotalProblemNodesLANG[lang] = 0
        FaultyFix[lang] = 0
    }

    // this is the log file in which we will track any modifications that we make to the translation
    let debug_lang = {}
    for (const lang of languages){
        debug_lang[lang] = ''
    }
        
    // Loop through the flows
    for (const flow of object.flows) {
        
        // Pull in the translated text, note this may be blank if there is a missing translation
        let curr_loc = flow.localization;

        TotalFlowCount++

        // Code below loops through the flow and looks for any 'arguments' storing in an object
        const routers = flow.nodes
            .filter((node) => node.router && node.router.operand === '@input.text')
            .reduce(
                (acc, node) => {
                    acc[node.uuid] = node;
                    return acc;
                },
                {}
            );

        // Loop through the nodes looking for ones with quick replies, if we find quick replies we will check the link to the arguments and potentially fix the translation if it does not match the english
        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {                    
                    if (action.quick_replies.length > 0) {
                        TotalQRNodes++                                                
                        [debug_lang, modified_arguments, modified_argument_IDs, modified_argument_lang] = fix_translated_arguments(flow, node, action, curr_loc, routers, debug_lang);
                        
                        //We need to take our modified arguments and insert them back into the main object so we can export a fixed version
                        //console.log(modified_argument_IDs)
                        for(const row in modified_arguments){                            
                            curr_loc[modified_argument_lang[row]][modified_argument_IDs[row]].arguments[0] = modified_arguments[row]
                        }
                    }
                }
            }
        }        
    }
    
    for (const lang of languages) {     
        debug_lang[lang] = 'This file provides a log of where there are possible errors between the translated quick replies and the arguments and where an automated fix has been applied using the "fix_arg_qr_translations" script\n\n'
                        + 'Language: ' + lang + '\n'
                        + 'Total flows in JSON file: ' + TotalFlowCount + '\n'
                        + 'Total nodes with "quick replies": ' + TotalQRNodes + '\n\n'
                        + 'Total quick reply nodes missing some translation: ' + NonTranslatedQR[lang] + '\n'
                        + 'Total arguments nodes missing some translation: ' + NonTranslatedArguments[lang] + '\n\n'
                        + 'Total modified flows: ' + TotalProblemFlowsLANG[lang] + '\n'
                        + 'Total modified nodes: ' + TotalProblemNodesLANG[lang] + '\n'
                        + 'Total nodes not successfully fixed: ' + FaultyFix[lang] + '\n'
                        + 'ID of failed nodes: ' + FailedFix[lang] + '\n\n'
                        + debug_lang[lang];   
    }
    return [object, debug_lang, languages];
}

function fix_translated_arguments(flow, node, action, curr_loc, routers, debug_lang){
    let modified_arguments = []
    let modified_argument_IDs = []
    let modified_argument_lang = []
    let incompleteQRtranslation = [] 
    let incompleteargumenttranslation = []   

    // id of corresponding wait for response node
    const dest_id = node.exits[0].destination_uuid;

    // setting up variables to store 'linker' matrix, connecting arguments to QR
    let EngLinker = []
    let OtherLinker = []
    let OtherNewLinker = []
    let EngLooseArg = []
    let OtherLooseArg = []
    let OtherNewLooseArg = []
    
    // record the quick replies we are looking at, convert to lowercase in the process
    var EngQR = utility.collect_Eng_qr(action)    
    
    // collect all the translated quick replies as well
    let OtherQR = {}
    for (const lang in curr_loc) {
        incompleteQRtranslation[lang] = false
        let [helper_array, TranslationLog, MissingTranslationCount] = utility.collect_Other_qr(EngQR, action, curr_loc, lang)
        OtherQR[lang] = helper_array

        if(MissingTranslationCount>0){
            NonTranslatedQR[lang]++
            incompleteargumenttranslation[lang] = true
        }        
    }   

    // record the arguments we are looking at, convert to lowercase in the process
    let refnode = routers[dest_id];
    if (refnode) {  
        
        // collect english arguments and their types together into an array              
        var [EngArg, ArgTypes, ArgIDs] = utility.collect_Eng_arguments(refnode)

        // collect all the translated arguments as well, where we find errors in the translation we will make a log
        var OtherArg = {}
        for (const lang in curr_loc) {
            incompleteargumenttranslation[lang] = false
            let [helper_array, TranslationLog, MissingTranslationCount] = utility.collect_Other_arguments(ArgIDs, ArgTypes, EngArg, curr_loc, lang)
            OtherArg[lang] = helper_array
             
            if(MissingTranslationCount>0){
                NonTranslatedArguments[lang]++
                incompleteargumenttranslation[lang] = true
            }
        }
    }

    // generate the Eng connection matrix 
    [EngLinker, EngLooseArg] = utility.create_connection_matrix(EngArg, ArgTypes, EngQR)
    
    // generate the lang connection matrix
    for (const lang in curr_loc) {
        [OtherLinker[lang], OtherLooseArg[lang]] = utility.create_connection_matrix(OtherArg[lang], ArgTypes, OtherQR[lang])
    }

    // look for where we have errors in the translation create a fix   
    for (const lang in curr_loc) {
        
        if (utility.no_match_matrix(EngLinker,OtherLinker[lang])){
            
            // store a copy of the arguments before we start making any modifications
            let OriginalArguments = [...OtherArg[lang]]        

            // check if the EngQR are the same as the translatedQR, this means the quick replies have not been translated and therefore we shouldnt bother applying a fix           
            if(utility.arrayEquals(EngQR, OtherQR[lang])){
                //debug_lang[lang] += '##### Quick replies not translated at all, therefore no automatic fix attempted\n'
                break
            }

            if(incompleteQRtranslation[lang]){
                debug_lang[lang] += '##### Quick replies not fully translated\n'
            }

            if(incompleteargumenttranslation[lang]){
                debug_lang[lang] += '##### Arguments not fully translated\n'
            }

            for(const row in EngLinker){                
                if(/\d/.test(EngLinker[row][0]) && /\d/.test(EngLinker[row][1])){
                    //pull in the associated argument that we should be looking at 
                    let CorrectArgRef = parseInt(EngLinker[row][1]) 
                    let LangArgRef = OtherLinker[lang][row][1] 
                    let CorrectArgType = ArgTypes[CorrectArgRef]

                    if (CorrectArgType == 'has_any_word'){
                        // If we have an error we will replace all 'has_any_word' arguments with the QR as this gives the best chance of a fix working
                        OtherArg[lang][CorrectArgRef] += " " + OtherQR[lang][row].toString()

                        if(String(CorrectArgRef) != String(LangArgRef) && String(LangArgRef) != ""){
                            // this situation occurs if the translated argument is now matching with the wrong QR, we want to clear the words that are causing problems
                            let dangerwords = utility.split_string(OtherQR[lang][row])
                            // run though the referenced arguments clearing problematic words
                            for (const item of LangArgRef){
                                if(String(CorrectArgRef) != String(item)){
                                    let newargument = ''
                                    let argumentwords = utility.split_string(OtherArg[lang][item])
                                    for (const word of argumentwords){
                                        if (!dangerwords.includes(word)){
                                            newargument += word + " "
                                        }
                                    }
                                    OtherArg[lang][item] = newargument
                                }                                                            
                            }                       
                        }                     
                                               
                    }else if(String(CorrectArgRef) != String(LangArgRef)){
                        //for the other arg types the fix is more simple, we just replace with the entine QR
                        OtherArg[lang][CorrectArgRef] = OtherQR[lang][row].toString()                                                          
                                                                                       
                    }
                }                
            }

            // We have now replaced the possibly faulty arguments with the QR, however there is no guarnetee that the QR words themselves do no cause conflict, we therefore run the has_any_words check to try and improve the arguments
            let FixedArguments = []
            let i = 0
            for(const member of utility.CreateUniqueArguments(OtherArg[lang], ArgTypes, OtherQR[lang], EngLinker)){
                //Form an array of the final arguments which we can then print in the log file
                FixedArguments.push(member)
                
                //Make a log of the modified arguments so we can subsequently modify the source object
                modified_argument_lang.push(lang)
                modified_argument_IDs.push(ArgIDs[i])                
                modified_arguments.push(member)  
                i++                          
            }

            // Generate a new linker for our file
            [OtherNewLinker[lang], OtherNewLooseArg[lang]] = utility.create_connection_matrix(FixedArguments, ArgTypes, OtherQR[lang])

            
                       
            // only want to log the flow details once so check if we have previously logged
            if(!debug_lang[lang].includes(flow.uuid)){
                TotalProblemFlowsLANG[lang]++
                debug_lang[lang] += `    Problem flow: ${TotalProblemFlowsLANG[lang]}\n`
                debug_lang[lang] += `    Flow ID: ${flow.uuid}\n`
                debug_lang[lang] += `    Flow name: ${flow.name}\n\n`
            }

            // Check if the fix has been successful
            if (utility.no_match_matrix(EngLinker,OtherNewLinker[lang])){
                FaultyFix[lang]++
                debug_lang[lang] += `#### Fix has been attempted but is not successful, requires manual review ####\n`
                if(typeof FailedFix[lang] == 'undefined'){
                    FailedFix[lang] = node.uuid
                }else{
                    FailedFix[lang] += ', ' + node.uuid
                }
            }
            
            TotalProblemNodesLANG[lang]++
            debug_lang[lang] += `        QR Node ID: ${node.uuid}\n`
            debug_lang[lang] += `        Arg Node ID: ${dest_id}\n`
            debug_lang[lang] += `        Action text: ${action.text.replace(/(\r\n|\n|\r)/gm, "; ")}\n`;
            debug_lang[lang] += '        Eng Quick replies:\n'
            for (const row of EngQR){
                debug_lang[lang] += `                ${row}\n`
            }
            debug_lang[lang] += `        Eng Arguments:\n`
            for (const ref in EngArg){
                debug_lang[lang] += `                ${EngArg[ref]}  -  ${ArgTypes[ref]}\n`
            }
            debug_lang[lang] += '        Eng Links:\n'
            for (const row of EngLinker){
                debug_lang[lang] += `                ${row}\n`
            }
            debug_lang[lang] += '        -----\n' 
            debug_lang[lang] += `        ${lang} Quick replies:\n`
            for (const row of OtherQR[lang]){
                debug_lang[lang] += `                ${row}\n`
            }           
            debug_lang[lang] += `        ${lang} Old Arguments:\n`
            for (const ref in OriginalArguments){
                debug_lang[lang] += `                ${OriginalArguments[ref]}  -  ${ArgTypes[ref]}\n`
            }
            debug_lang[lang] += `        ${lang} Old Links:\n`
            for (const row of OtherLinker[lang]){
                debug_lang[lang] += `                ${row}\n`
            } 
            debug_lang[lang] += '\n'
            debug_lang[lang] += `        ${lang} New Arguments:\n`
            for (const ref in FixedArguments){
                debug_lang[lang] += `                ${FixedArguments[ref]}  -  ${ArgTypes[ref]}\n`
            }
            debug_lang[lang] += `        ${lang} New Links:\n`
            for (const row of OtherNewLinker[lang]){
                debug_lang[lang] += `                ${row}\n`
            } 
            debug_lang[lang] += '\n' 
        }
    }
    return [debug_lang, modified_arguments, modified_argument_IDs, modified_argument_lang] 
}

module.exports = {
    fix_arg_qr_translation
};
