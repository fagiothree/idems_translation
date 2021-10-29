// This script is used to look at the link between Quick Replies and arguments
// It is important to check that all arguments have at least one connection, and that the connections are maintained after translation

const utility = require('./translation_functions.js');
const fs = require('fs');

// this is the log file which looks at the original english text and prints a log of nodes with potential errors
let debug = '';

// this is the log file which looks at the translated text and checks it is consistent with the english
let debug_lang = {};

//Block of code for testing functions
        var object = JSON.parse(fs.readFileSync("C:/Users/edmun/Code/TestFiles/translated_flows.json").toString());
        var [out1, out2] = fix_integrity(object)
        // export eng log files
        fs.writeFile("C:/Users/edmun/Code/TestFiles/englog.txt", out1, outputFileErrorHandler)
        for (const key in out2){
            fs.writeFile(`C:/Users/edmun/Code/TestFiles/${key}log.txt`, out2[key], outputFileErrorHandler)
        }

function fix_integrity(object) {
    
    // Loop through the flows
    for (const flow of object.flows) {
        
        // Pull in the translated text, note this may be blank if this is the english version
        let curr_loc = flow.localization;

        // Set up our log files and record the flow names 
        if(debug == ''){
            debug += `Language: Eng\n`;
        }

        for (const lang in curr_loc) {          
            if (debug_lang.hasOwnProperty(lang) == false){
                debug_lang[lang] = `Language: ${lang}\n`;
            }
        }

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
                    if (action.quick_replies.length > 0) {
                                                
                       [debug, debug_lang] = log_integrity(flow, node, action, curr_loc, routers, debug, debug_lang);
                        
                    }
                }
            }
        }
    }

    return [debug, debug_lang];
}

function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}

function log_integrity(flow, node, action, curr_loc, routers, debug, debug_lang){

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
        let helper_array=[]
        for (let qr of curr_loc[lang][action.uuid].quick_replies){
            helper_array.push(qr.toString().toLowerCase())
        }
        OtherQR[lang] = helper_array
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
            let helper_array = []
            for (let ID of ArgID){
                helper_array.push(curr_loc[lang][ID].arguments.toString().toLowerCase())
            }
            OtherArg[lang] = helper_array
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
        
        debug += `\nFlow name: ${flow.name}\n\n`
        debug += `Node uuid: ${node.uuid}\n`
        debug += `Action text: ${action.text}\n`
        debug += 'Quick replies:\n'
        for (const row of EngQR){
            debug += `                ${row}\n`
        }
        debug += `Arguments:\n`
        for (const ref in EngArg){
            debug += `                ${EngArg[ref]}  -  ${ArgTypes[ref]}\n`
        }
        debug += '\nLink: "Quick Reply","Argument"\n'
        for (const row of EngLinker){
        debug += `                  ${row}\n`
        } 
        debug += '\n' 
    }

    // look for where we have errors in the translation and put in a log file   
    for (const lang in curr_loc) {
         
        if (basic_error_check(OtherLinker[lang]) || OtherLooseArg[lang] || no_match_matrix(EngLinker,OtherLinker[lang])){
            
            debug_lang[lang] += `\nFlow name: ${flow.name}\n\n`
            debug_lang[lang] += `Node uuid: ${node.uuid}\n`
            debug_lang[lang] += `Action text: ${curr_loc[lang][action.uuid].text[0]}\n`;
            debug_lang[lang] += 'Quick replies:\n'
            for (const row of OtherQR[lang]){
                debug_lang[lang] += `                ${row}\n`
            }
            debug_lang[lang] += `Arguments:\n`
            for (const ref in OtherArg[lang]){
                debug_lang[lang] += `                ${OtherArg[lang][ref]}  -  ${ArgTypes[ref]}\n`
            }
            debug_lang[lang] += '\nLink: "Quick Reply","Argument"\n'
            for (const row of OtherLinker[lang]){
                debug_lang[lang] += `                  ${row}\n`
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
                    // console.log(r_exp)       
                    if (r_exp.test(quick_replies[i])){
                        if (utility.CountIf(k,allmatches) ==0){
                            allmatches.push(k)                            
                        }
                    }
                }
            }
            else if(argument_types[k] == 'has_all_words'){
                // for the has_all_words we need to check all argwords are in a particular quick reply
                for (var n = 0; n < argwords[k].length; n++ ){        
                    if (utility.CountIf(argwords[k][n],qrwords[i])=0){
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
            else if(argument_types[k] == 'has_any_word'){
                // for the has_any_word case we try to find any matching words between the arg and qr
                for (var n = 0; n < argwords[k].length; n++ ){        
                    if (utility.CountIf(argwords[k][n],qrwords[i])>0){
                        if (utility.CountIf(k,allmatches) ==0){
                            allmatches.push(k)                            
                        }
                    }
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
    for (const i in a){
        if (String(a[i][0]) != String(b[i][0])  || String(a[i][1]) != String(b[i][1])){
            no_match = true
            break
        }
    }
    return no_match
}

function split_args(args) {
    return args.split(/[\s,]+/).filter((i) => i);
}
