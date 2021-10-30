// This script is used to look at arguments on the wait for response nodes
// If we have 'has any of the words' conditions we need to check that there are is no commonality between the words
// This is particularly likely to be a problem following translation
// This script takes in a JSON string, looks for potential clashes in the 'has_any_words' arguments, removes the error and produces a log file
// it will look through and the english and the translations and output log of all changes to the same file

const utility = require('./translation_functions.js');
const fs = require('fs');        

function fix_has_any_words(object){

    // Set up variables that are used in the log file
    fixlog = ''
    TotalFlowCount = 0
    TotalModifiedFlows = 0
    BiggestFlow = 0
    SmallestFlow = 100
    TotalNodeCount = 0
    TotalHasAnyWordNodes = 0
    TotalModifiedNodes = 0
            
    // Drill down to find the arguments
    for (const flow of object.flows) {

    // Pull in the translated text, note this may be blank if this is the english version
    let curr_loc = flow.localization;

        TotalFlowCount++
        NodeCount = 0
        HasAnyWordNodes = 0
        ModifiedNodes = 0
        ModifiedNodeDetail = ''

        for (const node of flow.nodes) {
            // Check if there is a router in this node if so iterate through the cases
            TotalNodeCount++
            NodeCount++
                
            try {
                for(const cases of node.router.cases){ 
                    // First check that there is at least one 'has_any_word' argument and if so set 'assessment_required' to true
                    assessment_required = false  
                    if(cases.type == "has_any_word"){
                        HasAnyWordNodes++
                        TotalHasAnyWordNodes++
                        assessment_required = true
                        break
                    }
                }
            }            
            catch(err) {
                continue
            }      
                
            if(assessment_required){
                
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
                for (const lang in curr_loc) {
                    let helper_array = []
                    for (let ID of originalargids){
                        try{
                            helper_array.push(curr_loc[lang][ID].arguments.toString().toLowerCase().trim());
                        }
                        catch(err){
                            continue
                        }                        
                    }
                    otherargs[lang] = helper_array
                }   

                // Process argument and remove duplicate words in english
                const UniqueArguments = utility.CreateUniqueArguments(originalargs, originalargtypes)

                // If the UniqueArguments are different from the original args in english, we need to insert these back into the JSON object
                if(utility.arrayEquals(UniqueArguments,originalargs) == false){
                    TotalModifiedNodes++
                    ModifiedNodes++                
                    ModifiedNodeDetail += '        Modified Node: ' + ModifiedNodes + '\n'
                    ModifiedNodeDetail += '        Language: Eng\n'
                    ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                    ModifiedNodeDetail += '        Argument types: ' + originalargtypes + '\n'
                    ModifiedNodeDetail += '        Arguments before modification: ' + originalargs + '\n'
                    ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'

                    i = 0
                    for(const cases of node.router.cases){               
                        cases.arguments[0] = UniqueArguments[i];
                        i++      
                    }                                                           
                }  
                
                // Process argument and remove duplicate words in the translation
                for (const lang in curr_loc) {  
                    const UniqueArguments = utility.CreateUniqueArguments(otherargs[lang], originalargtypes)

                    // If the UniqueArguments are different from the original args in translation, we need to insert these back into the JSON object
                    if(utility.arrayEquals(UniqueArguments,otherargs[lang]) == false){
                        TotalModifiedNodes++
                        ModifiedNodes++                
                        ModifiedNodeDetail += '        Modified Node: ' + ModifiedNodes + '\n'
                        ModifiedNodeDetail += '        Language: ' + lang + '\n'
                        ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                        ModifiedNodeDetail += '        English arguments: ' + originalargs + '\n'
                        ModifiedNodeDetail += '        Argument types: ' + originalargtypes + '\n' 
                        ModifiedNodeDetail += '        Arguments before modification: ' + otherargs[lang] + '\n'
                        ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'

                        i = 0

                        for (const ref in originalargids){
                            try{
                                curr_loc[lang][originalargids[ref]].arguments = UniqueArguments[ref]
                            }
                            catch(err){
                                continue
                            }                             
                        }                                                    
                    }     
                }
            }                  
        }
        if(ModifiedNodes>0){
            TotalModifiedFlows++
            fixlog += '    Modified Flow: ' + TotalModifiedFlows + '\n'
            fixlog += '    Flow ID: ' + flow.uuid + '\n'
            fixlog += '    Flow name: ' + flow.name + '\n'        
            fixlog += '    Total nodes: ' + NodeCount + '\n'
            fixlog += '    Nodes with "has any words" arguments: ' + HasAnyWordNodes + '\n'
            fixlog += '    Nodes which have been modified due to duplication in arguments (considers different languages as different nodes): ' + ModifiedNodes + '\n\n'
            fixlog += ModifiedNodeDetail
        }

        if(NodeCount>BiggestFlow){
            BiggestFlow = NodeCount
        }

        if(NodeCount<SmallestFlow){
            SmallestFlow = NodeCount
        }
        
    }

    //Add some text to start of fixlog file
    fixlog =    'Log of changes made using the FixingArguments.js script' + '\n\n'
                + 'Total flows in JSON file: ' + TotalFlowCount + '\n'
                + 'Largest flow has: ' + BiggestFlow + ' nodes \n'
                + 'Smallest flow has: ' + SmallestFlow + ' nodes \n'
                + 'Average nodes per flow: ' + Math.round(TotalNodeCount/TotalFlowCount) + '\n'
                + 'Total nodes with at least one "has_any_word" argument: ' + TotalHasAnyWordNodes + '\n'
                + 'Total Modified Flows: ' + TotalModifiedFlows + '\n'
                + 'Total Modified Nodes: ' + TotalModifiedNodes + '\n\n'
                + 'Details of the modified flows/ nodes are summarised below:' + '\n\n'
                + fixlog

    return [object, fixlog]
}

module.exports = {
    fix_has_any_words
};



