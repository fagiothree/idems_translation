// This script is used to look at the link between Quick Replies and arguments
// It is important to check that all arguments have at least one connection, and that the connections are maintained after translation
// It will look through english and other language versions, the results of each of the languages are recored separately to make the review process easier

const utility = require('./translation_functions.js');
const fs = require('fs'); 

// Code for running local tests on function - leave in place
//let filePath = "C:/Users/edmun/Code/TestFiles/Complete Process Check/9-PLH-localized-afr_mod.json"
//let obj = JSON.parse(fs.readFileSync(filePath).toString());
//const [a, b] = check_integrity(obj);

function check_integrity(object) {
    
    // Find out if there are languages in this file
    let languages = utility.findlanguages(object);

    // Set up variables that are used in the log files
    TotalFlowCount = 0
    TotalProblemFlowsENG = 0
    TotalNodeCount = 0
    TotalQRNodes = 0
    TotalProblemNodesENG = 0
    NonTranslatedQR = {};
    NonTranslatedArguments = {};
    TotalProblemFlowsLANG = {};
    TotalProblemNodesLANG = {};
    for (const lang of languages){
        NonTranslatedQR[lang] = 0;
        NonTranslatedArguments[lang] = 0;
        TotalProblemFlowsLANG[lang] = 0
        TotalProblemNodesLANG[lang] = 0
    }

    // this is the log file which looks at the original english text and prints a log of nodes with potential errors
    let debug = '';

    // this is the log file which looks at the translated text and checks it is consistent with the english
    let debug_lang = {};
    for (const lang of languages){
        debug_lang[lang] = ''
    }
        
    // Loop through the flows
    for (const flow of object.flows) {
        
        // Pull in the translated text, note this may be blank if this is the english version
        let curr_loc = flow.localization;

        TotalFlowCount++
        ProblemNodes = 0
        ProblemNodeDetail = ''
        ProblemNodesLANG = {};
        ProblemNodeDetailLANG = {};

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
        
        // Loop through the nodes looking for ones with quick replies, if we find quick replies we will check there is link to the arguments
        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    TotalQRNodes++
                    if (action.quick_replies.length > 0) {
                                                
                    [debug, debug_lang] = log_integrity(flow, node, action, curr_loc, routers, debug, debug_lang);
                        
                    }
                }
            }
        }
    }

    // Add some helper text to the top of the log files 
    debug = 'This file provides a log of where there are possible errors between the quick replies and the arguments identified using the "check_integrity" script\n\n'
            + 'Language: Eng\n'
            + 'Total flows in JSON file: ' + TotalFlowCount + '\n'
            + 'Total nodes with "quick replies": ' + TotalQRNodes + '\n\n'
            + 'Total problem flows: ' + TotalProblemFlowsENG + '\n'
            + 'Total problem nodes: ' + TotalProblemNodesENG + '\n\n'
            + 'Details of the problem flows/ nodes are summarised below:\n\n'
            + debug;
    
    for (const lang of languages) {     
        debug_lang[lang] = 'This file provides a log of where there are possible errors between the quick replies and the arguments\n\n'
                        + 'Language: ' + lang + '\n'
                        + 'Total flows in JSON file: ' + TotalFlowCount + '\n'
                        + 'Total nodes with "quick replies": ' + TotalQRNodes + '\n\n'
                        + 'Total quick reply nodes missing translation: ' + NonTranslatedQR[lang] + '\n'
                        + 'Total arguments nodes missing translation: ' + NonTranslatedArguments[lang] + '\n\n'
                        + 'Total problem flows: ' + TotalProblemFlowsLANG[lang] + '\n'
                        + 'Total problem nodes: ' + TotalProblemNodesLANG[lang] + '\n\n'
                        + debug_lang[lang];   
    }
    return [debug, debug_lang, languages];
}

function log_integrity(flow, node, action, curr_loc, routers, debug, debug_lang){

    let incompletetranslation = false

    // id of corresponding wait for response node
    const dest_id = node.exits[0].destination_uuid;

    // setting up variables to store  quick replies
    let EngQR = [];
    let OtherQR = [];

    // setting up a variables to store arguments
    let ArgTypes = [];
    let ArgID = [];
    let EngArg = [];
    let OtherArg = [];

    // setting up variables to store 'linker' matrix, connecting arguments to QR
    let EngLinker = []
    let OtherLinker = []
    let EngLooseArg = []
    let OtherLooseArg = []
    
    // record the quick replies we are looking at, convert to lowercase in the process
    for (let qr of action.quick_replies){
        EngQR.push(qr.toString().toLowerCase())
    }
    for (const lang in curr_loc) {
        let translation_present = true
        let helper_array=[]
        try{
            let translation = curr_loc[lang][action.uuid].quick_replies
            for (let qr of translation){
                //this checks whether the localization is translated
                if (EngQR.includes(qr.toString().toLowerCase())){
                    translation_present = false
                }
                helper_array.push(qr.toString().toLowerCase())                                
            }
        }
        catch{
            // this checks whether the id exists in the localization
            translation_present = false
        }
        OtherQR[lang] = helper_array
        if(translation_present == false){
            NonTranslatedQR[lang]++
            debug_lang[lang] += '##### Quick replies not fully translated\n'
            incompletetranslation = true
        }
    }   

    // record the arguments we are looking at, convert to lowercase in the process
    let router = routers[dest_id];
    if (router) {        
        for (let curr_case of router.router.cases) {     
            EngArg.push(curr_case.arguments[0].toString().toLowerCase())
            ArgTypes.push(curr_case.type)
            ArgID.push(curr_case.uuid)            
        }
                
        for (const lang in curr_loc) {
            let translation_present = true
            let helper_array = []
            try{
                for (let ref in ArgID){ 
                    let translation = curr_loc[lang][ArgID[ref]].arguments.toString().toLowerCase()
                    // this checks whether the localization is translated
                    if (EngArg.includes(translation)){
                        translation_present = false
                    }
                    helper_array.push(translation)                     
                }   
            }
            catch(err){
                // this checks whether the id exists in the localization
                tanslation_present = false
            }
            OtherArg[lang] = helper_array
            if(translation_present == false){
                NonTranslatedArguments[lang]++
                debug_lang[lang] += '##### Arguments not fully translated\n'
                incompletetranslation = true
            }               
        }
    }

    // generate the Eng connection matrix 
    [EngLinker, EngLooseArg] = create_connection_matrix(EngArg, ArgTypes, EngQR)
    
    // generate the lang connection matrix
    for (const lang in curr_loc) {
        [OtherLinker[lang], OtherLooseArg[lang]] = create_connection_matrix(OtherArg[lang], ArgTypes, OtherQR[lang])
    }

    // look for where we have errors in the english and put in a log file
    if (basic_error_check(EngLinker) || EngLooseArg){

        // only want to log the flow details once so check if we have previously logged
        if(!debug.includes(flow.uuid)){
            TotalProblemFlowsENG++
            debug += `    Problem flow: ${TotalProblemFlowsENG}\n`
            debug += `    Flow ID: ${flow.uuid}\n`
            debug += `    Flow name: ${flow.name}\n\n`
        }
    
        TotalProblemNodesENG++
        debug += `        Node ID: ${node.uuid}\n`
        debug += `        Action text: ${action.text.replace(/(\r\n|\n|\r)/gm, "; ")}\n`
        debug += '        Quick replies:\n'
        for (const row of EngQR){
            debug += `                ${row}\n`
        }
        debug += `        Arguments:\n`
        for (const ref in EngArg){
            debug += `                ${EngArg[ref]}  -  ${ArgTypes[ref]}\n`
        }
        debug += '        Link "QR","Argument"\n'
        for (const row of EngLinker){
        debug += `                ${row}\n`
        } 
        debug += '\n' 
    }

    // look for where we have errors in the translation and put in a log file   
    for (const lang in curr_loc) {
        
        if (basic_error_check(OtherLinker[lang]) || OtherLooseArg[lang] || no_match_matrix(EngLinker,OtherLinker[lang]) || incompletetranslation){
            
            // only want to log the flow details once so check if we have previously logged
            if(!debug_lang[lang].includes(flow.uuid)){
                TotalProblemFlowsLANG[lang]++
                debug_lang[lang] += `    Problem flow: ${TotalProblemFlowsLANG[lang]}\n`
                debug_lang[lang] += `    Flow ID: ${flow.uuid}\n`
                debug_lang[lang] += `    Flow name: ${flow.name}\n\n`
            }
            
            TotalProblemNodesLANG[lang]++
            debug_lang[lang] += `        Node ID: ${node.uuid}\n`
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
            debug_lang[lang] += `        ${lang} Arguments:\n`
            for (const ref in OtherArg[lang]){
                debug_lang[lang] += `                ${OtherArg[lang][ref]}  -  ${ArgTypes[ref]}\n`
            }
            debug_lang[lang] += `        ${lang} Links:\n`
            for (const row of OtherLinker[lang]){
                debug_lang[lang] += `                ${row}\n`
            } 
            debug_lang[lang] += '\n' 
        }
    }
    return [debug, debug_lang] 
}

function create_connection_matrix(arguments,argument_types,quick_replies){
    let connection_matrix = [];
    let argwords = [];
    let qrwords = []

    // set up an array with the arguments stored as arrays of words
    for (const index in arguments){
        argwords[index] = split_args(arguments[index])
    }

    // set up an array with the quick replies stored as arrays of words
    for (const qr of quick_replies){
        qrwords.push(qr.split(/-| |'/))
    }

    // look through the quick replies looking for matches with the arguments
    for (var i = 0; i < quick_replies.length; i++){

        let allmatches = []
        
        for (var k = 0; k < arguments.length; k++){
            
            if(argument_types[k] == 'has_any_word'){
                // for the has_any_word case we try to find any matching words between the arg and qr string
                for (const word of argwords[k]){ 
                    let r_exp = new RegExp(`\\b${word}\\b`, "i");      
                    if (r_exp.test(quick_replies[i])){
                        if (utility.CountIf(k,allmatches) ==0){
                            allmatches.push(k)                            
                        }
                    }
                }
            }
            else if(argument_types[k] == 'has_all_words'){
                // for the has_all_words we need to check all argwords are in a particular quick reply
                for (const word of argwords[k]){ 
                    let r_exp = new RegExp(`\\b${word}\\b`, "i");        
                    if (r_exp.test(quick_replies[i]) == false){
                        break
                    }else if (n < argwords[k].length-1){
                        continue
                    }else {
                        allmatches.push(k)                                                
                    }
                }
            }
            else if(argument_types[k] == 'has_phrase'){
                // for has phrase we look for a string within a string
                if (new RegExp(arguments[k], 'i').test(quick_replies[i])) {
                    allmatches.push(k)                    
                }
            }
            else if(argument_types[k] == 'has_only_phrase'){
                // for has_only_phrase we look for a complete match
                if (arguments[k].trim() == quick_replies[i].trim()){
                    allmatches.push(k)                    
                }
            }
        }

        connection_matrix[i] = [i, allmatches]
    }

    //we have now gone through all the quick replies checking if they have a link to an argument
    //it would also be nice to know if all the arguments have a link to a quick reply
    let loose_arg = false

    //form an array of the arguments that have already matched to a quick reply
    let linkedargs = ''
    for (const row of connection_matrix){
        linkedargs += row[1]
    }
    
    //loop through arg refs, if any are not present append to bottom of connection_matrix
    for (const argref in arguments){
        if (linkedargs.includes(argref)==false){
            connection_matrix[i] = [" ", argref] 
            loose_arg = true
            i++           
        }
    }

    return [connection_matrix, loose_arg]

}  

function basic_error_check(arr){
    let error = false
    for(const member of arr){        
        if(member[1].length > 1 || member[1] == ""){
            error = true
            return error            
        }
    }
    return error
}

function no_match_matrix(a,b){
    let no_match = false
    try{
        for (const i in a){
            if (String(a[i][0]) != String(b[i][0])  || String(a[i][1]) != String(b[i][1])){
                no_match = true
                break
            }
        }
    }catch(err){
        no_match = true
    }
    
    return no_match
}

function split_args(args) {
    return args.split(/[\s,]+/).filter((i) => i);
}

module.exports = {
    check_integrity
};
