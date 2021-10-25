// This script is used to look at arguments on the wait for response nodes
// If we have 'has any of the words' conditions we need to check that there are is no commonality between the words
// This is particularly likely to be a problem following translation
// This script takes in a JSON string, looks for potential clashes in the 'has_any_words' arguments, removes the error and produces a log file

const utility = require('./translation_functions.js');

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
                const originalargs = []
                const originalargtypes = []
                for(const cases of node.router.cases){
                    for(const argument of cases.arguments){
                        originalargs.push(argument.trim().toLowerCase())                                               
                    }
                    for(const type of cases.type){
                        originalargtypes.push(type.trim())                                               
                    }
                }
                // Process argument and remove duplicate words
                const UniqueArguments = utility.CreateUniqueArguments(originalargs, originalargtypes)

                // If the UniqueArguments are different from the original args, we need to insert these back into the JSON object
                if(utility.arrayEquals(UniqueArguments,originalargs) == false){
                    TotalModifiedNodes++
                    ModifiedNodes++                
                    ModifiedNodeDetail += '        Modified Node: ' + ModifiedNodes + '\n'
                    ModifiedNodeDetail += '        Node ID: ' + node.uuid + '\n'
                    ModifiedNodeDetail += '        Arguments before modification: ' + originalargs + '\n'
                    ModifiedNodeDetail += '        Arguments after modification:  ' + UniqueArguments + '\n\n'

                    i = 0
                    for(const cases of node.router.cases){               
                        cases.arguments[0] = UniqueArguments[i];
                        i++      
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
            fixlog += '    Nodes which have been modified due to duplication in arguments: ' + ModifiedNodes + '\n\n'
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



