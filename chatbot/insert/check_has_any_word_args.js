// This script is used to look at arguments on the wait for response nodes
// If we have duplication within the arguments then it may cause the flow to run incorrectly
// This is particularly likely to be a problem following translation and on the nodes with 'has_any_words'
// There are certain fixes which may need to be done manually, however we can apply some automatic fixes by removing duplication in 'has_any_word' arguments
// This script takes in a JSON string, looks for potential clashes in the 'has_any_words' arguments, removes the error and produces a log file
// it will look through the english and the translations and output log of all changes to the same file

const utility = require('./translation_functions.js');
const fs = require('fs'); 

// Code for running local tests on function - leave in place
//let filePath = "C:/Users/edmun/Google Drive - EEM Engineering Ltd/Translation Checking/Malay 30.11.21/7 - PLH with MSA.json"
//let obj = JSON.parse(fs.readFileSync(filePath).toString());
//const [a, b] = fix_has_any_words(obj);

function fix_has_any_words(object){

    // Find out if there are languages in this file
    let languages = utility.findlanguages(object);

    // Set up variables that are used in the log file
    TotalFlowCount = 0
    TotalProblemFlows = 0
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

        //Get the list of nodes that we need to look at by finding all nodes that have at least one 'has_any_word' argument
        let [TextArgumentNodes, MatchNodeCount] = utility.retrieve_arguments(flow, 'has_any_word') 
        TotalHasAnyWordNodes += MatchNodeCount      

        for (const node of flow.nodes) {

            //Check if this is one of the nodes we need to look at
            if(TextArgumentNodes.includes(node.uuid)){

                incompletetranslation = false

                // collect english arguments and their types together into an array              
                let [EngArg, ArgTypes, ArgID] = utility.collect_Eng_arguments(node)

                // collect all the translated arguments as well, where we find errors in the translation we will make a log
                let OtherArg = {}
                for (const lang of languages) {
                    let [helper_array, TranslationLog, MissingTranslationCount] = utility.collect_Other_arguments(ArgID, ArgTypes, EngArg, curr_loc, lang)
                    OtherArg[lang] = helper_array
                    //ModifiedNodeDetail += TranslationLog
                    langerror[lang] += MissingTranslationCount
                    if(MissingTranslationCount>0){
                        incompletetranslation = true
                    }
                }

                if (incompletetranslation){
                    NonTranslatedNodes++
                    incompletetranslation = false
                }

                // Process argument and remove duplicate words in english
                const UniqueArguments = utility.CreateUniqueArguments(EngArg, ArgTypes)

                // If the UniqueArguments are different from the original args in english, we need to insert these back into the JSON object
                if(utility.arrayEquals(UniqueArguments,EngArg) == false){

                    let i = 0
                    let indicator = true
                    for(const cases of node.router.cases){               
                        
                        // we need to check that our code has not completely removed the arguments, if it has then we do not implement the change
                        if(UniqueArguments[i] == ""){
                            // in the case when our code would have removed all of the arguments, we insert the original args back into the unique arguments matrix so it is easy to understand in the log
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
                    ModifiedNodeDetail += '        Argument types: ' + ArgTypes + '\n'
                    ModifiedNodeDetail += '        Arguments before modification: ' + EngArg + '\n'
                    ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'                                                                          
                }  
                
                // Process argument and remove duplicate words in the translation
                for (const lang of languages) { 
                        
                    const UniqueArguments = utility.CreateUniqueArguments(OtherArg[lang], ArgTypes)

                    // If the UniqueArguments are different from the original args in translation, we need to insert these back into the JSON object
                    if(utility.arrayEquals(UniqueArguments,OtherArg[lang]) == false){
                        
                        let indicator = true
                        for (const ref in ArgID){
                            // we need to check that our code has not completely removed the arguments, if it has then we do not implement the change
                            if(UniqueArguments[ref] == ""){
                                // in the case when our code would have removed all of the arguments, we insert the original args back into the unique arguments matrix so it is easy to understand in the log
                                UniqueArguments[ref] = curr_loc[lang][ArgID[ref]].arguments
                                if(indicator){
                                    indicator = false
                                    ModifiedNodeDetail += '###### SERIOUS ISSUE, ARGUMENTS COULD NOT BE FULLY FIXED AS THIS WOULD RESULT IN NULL ARGUMENTS ######\n'
                                    SeriousModifiedNodes++
                                }
                            }else{
                                try{
                                    curr_loc[lang][ArgID[ref]].arguments = [UniqueArguments[ref]]
                                }catch{

                                }                                
                            }                                
                        }           

                        TotalModifiedNodes++               
                        ModifiedNodeDetail += '        Language: ' + lang + '\n'
                        ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                        ModifiedNodeDetail += '        English arguments: ' + EngArg + '\n'
                        ModifiedNodeDetail += '        Argument types: ' + ArgTypes + '\n' 
                        ModifiedNodeDetail += '        Arguments before modification: ' + OtherArg[lang] + '\n'
                        ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'                                            
                    }        
                } 
            }                  
        }
        if(ModifiedNodeDetail.length>0){
            TotalProblemFlows++
            fixlog += '    Problem Flow: ' + TotalProblemFlows + '\n'
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
                + 'Total Problem Flows: ' + TotalProblemFlows + '\n'
                //+ 'Total "has_any_word" nodes missing at least one translation: ' + NonTranslatedNodes + '\n'
                //+ '    Breakdown of number of arguments missing translation by language: ' + langerrorstring + '\n'
                + 'Total nodes with duplication in arguments which have been sucessfully modified (translations treated as individual nodes): ' + TotalModifiedNodes + '\n'                
                + 'Total serious errors where fix not applied as would have resulted in null arguments (translations treated as individual nodes): ' + SeriousModifiedNodes + '\n\n'
                + 'Details of the problem flows/ nodes are summarised below:' + '\n\n'
                + fixlog

    return [object, fixlog]
}

module.exports = {
    fix_has_any_words
};
