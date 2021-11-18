// Area to start breaking down translation process into a set of reusable functions

//Function takes a set of arguments and attempts to produce a set with no common words. If you provide argtypes it will only replace the "has_any_word" arguments,
// if you do not provide argtypes it will remove duplication wherever it finds it
function CreateUniqueArguments(originalargs, originalargtypes = [""]) {
    var UniqueArguments = []
    var UniqueWords = FindUniqueWords(originalargs)

    for (const i in originalargs){
        if(originalargtypes[i] == "has_any_word" || originalargtypes[0] == ""){
            let NewArgument = ""     
            const SplitArguments = split_args(originalargs[i]);
            for (const argumentword of SplitArguments){
                if (UniqueWords.includes(argumentword)){                
                    NewArgument += argumentword
                    NewArgument += " "
                }
            }
            UniqueArguments.push(NewArgument.trim())
        } else{
            UniqueArguments.push(originalargs[i])
        }                 
    }
return UniqueArguments
}

function FindUniqueWords(arr) {
    var AllWords = [];
    var UniqueWords = [];
    for (const argument of arr){
        const SplitArguments = split_args(argument)
        // Remove duplicate words within an argument as this will throw off the subsequent logic
        let SplitArgumentsUnique = [...new Set(SplitArguments)]
        for (const argumentword of SplitArgumentsUnique){
            AllWords.push(argumentword)
        }
    }
    for (const word of AllWords){
        if(CountIf(word, AllWords) == 1){
            UniqueWords.push(word)
        }
    }
    return UniqueWords
}

function CountIf(string, arr) {
    var counter = 0
    for (const member of arr){
        if (string == member){
            counter++
        }
    }
    return counter
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
}

function findlanguages(obj){
    let languages = []
    for (const flow of obj.flows){        
        let curr_loc = flow.localization
        for (const lang in curr_loc){
            if(languages.includes(lang.toString()) == false){
                languages.push(lang.toString())
            } 
        } 
    }
    return languages
}

function split_args(args){
    return args.split(/[\s,]+/).filter((i) => i);
}

function array_replace(arr,find,replace){
    let new_arr = []
    for (const member of arr){
        member.replace(find,replace)
        new_arr.push(member)
    }
    return new_arr
}

function collect_Eng_arguments(node){
    
    let EngArg = []
    let ArgTypes = []
    let ArgID = []

    // first collect the english arguments
    for(const curr_case of node.router.cases){                    
        EngArg.push(curr_case.arguments[0].toString().toLowerCase().trim().replace(/,/g," ").replace(/\s\s+/g, ' '))
        ArgTypes.push(curr_case.type)
        ArgID.push(curr_case.uuid)                                              
    }

    return [EngArg, ArgTypes, ArgID]
}

function collect_Other_arguments(ArgID, ArgTypes, EngArg, curr_loc, lang){
    let helper_array = []
    let TranslationLog = ''
    let MissingTranslationCount = 0

    // Array of argument types that should be translated
    TextArgTypes = ["has_any_word", "has_all_words", "has_only_phrase", "has_phrase"]

    // collect all the translated arguments as well, where we find errors in the translation we will make a log
        
    for (let ref in ArgID){
        // we are only expecting certain types of args to be translated
        if (TextArgTypes.includes(ArgTypes[ref]) && /[a-zA-Z]/.test(EngArg[ref])){
            try{
                let translation = curr_loc[lang][ArgID[ref]].arguments.toString().toLowerCase().trim().replace(/,/g," ").replace(/\s\s+/g, ' ')
                if(translation == EngArg[ref]){
                    // This catches where the localisation is still in english, we want to make a note
                    MissingTranslationCount++

                    //The below line prints the text id which have an incomplete translation
                    TranslationLog += '        Localization present but is in English: ' + ArgID[ref] + '\n'
                    TranslationLog += '        Arguments in question: ' + translation.toString() + '\n\n'

                }
                //even if we have idintified that it is still in english, we still want to process it, there are certain words that are common across languages so this may not be an error
                helper_array.push(translation);  
            }
            catch(err){
                // This will catch if there is no corresponding localisation ID, considering how the localization code works we should not get an error but leaving in here to be safe                                
                // if there are any missing translations in a node, we consider the node as a whole 'not translated'
                MissingTranslationCount++

                //The below line prints the text id which have an incomplete translation
                TranslationLog += '        Missing Translation in Localization: ' + ArgID[ref] + '\n\n'

                //if there is a missing translation then we just cannot handle this node altogether
                helper_array = []
                break
                
            }
        }else{
            // if we are not expecting a translation, we just push the original 
            helper_array.push(EngArg[ref]);
        }                          
    }

    return [helper_array, TranslationLog, MissingTranslationCount]
} 

function retrieve_arguments(flow, string){
    let TextArgumentNodes = []
    let MatchNodeCount = 0
    for (const node of flow.nodes) {  
        try{
            for (const curr_case of node.router.cases) {
                if (curr_case.type == string) {
                    TextArgumentNodes.push(node.uuid)
                    MatchNodeCount++
                    break
                }
            }
        }
        catch{}     
    }
    return [TextArgumentNodes, MatchNodeCount]
}

module.exports = {
    CreateUniqueArguments,
    CountIf,
    arrayEquals,
    findlanguages,
    split_args,
    array_replace,
    collect_Eng_arguments,
    collect_Other_arguments,
    retrieve_arguments
};
