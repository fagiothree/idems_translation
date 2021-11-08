// This script is used to look at arguments on the wait for response nodes
// If we have 'has any of the words' conditions we need to check that there are is no commonality between the words
// This is particularly likely to be a problem following translation
// This script takes in a JSON string, looks for potential clashes in the 'has_any_words' arguments, removes the error and produces a log file
// it will look through and the english and the translations and output log of all changes to the same file

const utility = require('./translation_functions.js');
const fs = require('fs'); 

// Code for running local tests on function - leave in place
//let filePath = "C:/Users/edmun/Code/TestFiles/Complete Process Check/translated_flows_tester.json"
//let obj = JSON.parse(fs.readFileSync(filePath).toString());
//const [a, b] = fix_has_any_words(obj);

function fix_has_any_words(object){

    // Find out if there are languages in this file
    let languages = utility.findlanguages(object);

    // Set up variables that are used in the log file
    TotalFlowCount = 0
    TotalModifiedFlows = 0
    TotalNodeCount = 0
    TotalHasAnyWordNodes = 0
    TotalModifiedNodes = 0
    NonTranslatedNodes = 0
    SeriousModifiedNodes = 0

    // Set up log file
    fixlog = ''

    // set up an array to store langerrors later in the process
    let langerror = {}
    for (const lang of languages){
        langerror[lang] = 0
    }
            
    // Drill down to look at individual flows
    for (const flow of object.flows) {

        // Pull in the translated text, note this may be blank if this is the english version or if this flow has not been translated
        let curr_loc = flow.localization;
        TotalFlowCount++
        ModifiedNodeDetail = ''
        TextArgumentNodes = []

        //Get the list of arguments that we need to check by seeing where the quick replies point us
        for (const node of flow.nodes) {    
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    if (action.quick_replies.length > 0) {
                        const dest_id = node.exits[0].destination_uuid;
                        TextArgumentNodes.push(dest_id)
                    }
                }
            }
        }

        for (const node of flow.nodes) {

            incompletetranslation = false
            TotalNodeCount++

            //Check if this is one of the nodes we need to look at
            if(TextArgumentNodes.includes(node.uuid) && node.hasOwnProperty('router')){
                // collect all the arguments and their types together into an array, convert all to lower case as RapidPro is not case sensitive
                let originalargs = []
                let originalargtypes = []
                let originalargids = []
                let otherargs = []

                // first collect the english arguments
                for(const curr_case of node.router.cases){                    
                    originalargs.push(curr_case.arguments[0].toString().toLowerCase().trim())
                    originalargtypes.push(curr_case.type)
                    originalargids.push(curr_case.uuid)                                              
                }

                // collect all the translated arguments as well
                for (const lang of languages) {
                    let helper_array = []
                    for (let ref in originalargids){
                        try{
                            helper_array.push(curr_loc[lang][originalargids[ref]].arguments.toString().toLowerCase().trim());
                        }
                        catch(err){
                            if(/[a-zA-Z]/.test(originalargs[ref])){
                                // if there are any missing translations in a node, we consider the node as a whole 'not translated'
                                langerror[lang]++
                                incompletetranslation = true

                                //The below line prints the text id which have an incomplete translation
                                ModifiedNodeDetail += '        Missing Translation: ' + originalargids[ref] + '\n\n'
                                break
                            }
                        }                        
                    }
                    otherargs[lang] = helper_array
                }  
                
                // if one of the translations is missings then we log the node as having a translation error
                if (incompletetranslation){
                    NonTranslatedNodes++
                    incompletetranslation = false
                }

                // Process argument and remove duplicate words in english
                const UniqueArguments = utility.CreateUniqueArguments(originalargs, originalargtypes)

                // If the UniqueArguments are different from the original args in english, we need to insert these back into the JSON object
                if(utility.arrayEquals(UniqueArguments,originalargs) == false){

                    let i = 0
                    let indicator = true
                    for(const cases of node.router.cases){               
                        
                        // we need to check that our code has not completely removed the arguments, if it has then we do not implement the change
                        if(UniqueArguments[i] == ""){
                            UniqueArguments[i] = cases.arguments[0]
                            if(indicator){
                                indicator = false
                                ModifiedNodeDetail += '###### SERIOUS ISSUE, ARGUMENTS COULD NOT BE FULLY FIXED AS THIS WOULD RESULT IN NULL ARGUMENTS ######\n'
                                SeriousModifiedNodes++
                            }
                        }else{
                            cases.arguments[0] = UniqueArguments[i];                            
                        } 
                        i++
                    }                      
                    
                    TotalModifiedNodes++
                    ModifiedNodeDetail += '        Language: Eng\n'
                    ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                    ModifiedNodeDetail += '        Argument types: ' + originalargtypes + '\n'
                    ModifiedNodeDetail += '        Arguments before modification: ' + originalargs + '\n'
                    ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'                                                                          
                }  
                
                // Process argument and remove duplicate words in the translation
                for (const lang of languages) { 
                        
                    const UniqueArguments = utility.CreateUniqueArguments(otherargs[lang], originalargtypes)

                    // If the UniqueArguments are different from the original args in translation, we need to insert these back into the JSON object
                    if(utility.arrayEquals(UniqueArguments,otherargs[lang]) == false){
                        
                        let indicator = true
                        for (const ref in originalargids){
                            if(UniqueArguments[ref] == ""){
                                UniqueArguments[ref] = curr_loc[lang][originalargids[ref]].arguments
                                if(indicator){
                                    indicator = false
                                    ModifiedNodeDetail += '###### SERIOUS ISSUE, ARGUMENTS COULD NOT BE FULLY FIXED AS THIS WOULD RESULT IN NULL ARGUMENTS ######\n'
                                    SeriousModifiedNodes++
                                }
                            }else{
                                curr_loc[lang][originalargids[ref]].arguments = UniqueArguments[ref]
                            }                                
                        }           

                        TotalModifiedNodes++               
                        ModifiedNodeDetail += '        Language: ' + lang + '\n'
                        ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                        ModifiedNodeDetail += '        English arguments: ' + originalargs + '\n'
                        ModifiedNodeDetail += '        Argument types: ' + originalargtypes + '\n' 
                        ModifiedNodeDetail += '        Arguments before modification: ' + otherargs[lang] + '\n'
                        ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'                                            
                    }        
                } 
            }                  
        }
        if(ModifiedNodeDetail.length>0){
            TotalModifiedFlows++
            fixlog += '    Problem Flow: ' + TotalModifiedFlows + '\n'
            fixlog += '    Flow ID: ' + flow.uuid + '\n'
            fixlog += '    Flow name: ' + flow.name + '\n\n'        
            fixlog += ModifiedNodeDetail
        }
    }

    //Add some text to start of fixlog file

    //Process the individual missing language erros into a single string to make it easier to understand
    let langerrorstring = ''
    for (const lang in langerror){
        langerrorstring += lang + " - " + langerror[lang] + ", "
    }
    
    fixlog =    'This file povides a log of changes made using the check_has_any_word_args.js script' + '\n\n'
                + 'Languages considered: ENG, ' + languages.toString() + '\n'
                + 'Total flows in JSON file: ' + TotalFlowCount + '\n'
                + 'Total nodes with "has_any_word" arguments: ' + TotalHasAnyWordNodes + '\n\n'
                + 'Total "has_any_word" nodes missing at least one translation and therefore not fully processed: ' + NonTranslatedNodes + '\n'
                + '    Breakdown by language of nodes missing translation: ' + langerrorstring + '\n\n'
                + 'Total Problem Flows: ' + TotalModifiedFlows + '\n'
                + 'Total Modified Nodes (translations treated as individual nodes): ' + TotalModifiedNodes + '\n'                
                + 'Total serious errors where fix not applied as would have resulted in null arguments (translations treated as individual nodes): ' + SeriousModifiedNodes + '\n\n'
                + 'Details of the modified flows/ nodes are summarised below:' + '\n\n'
                + fixlog

    return [object, fixlog]
}

module.exports = {
    fix_has_any_words
};
