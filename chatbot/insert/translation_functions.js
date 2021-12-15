// Area to start breaking down translation process into a set of reusable functions

//Function takes a set of arguments and attempts to produce a set with no common words. If you provide argtypes it will only replace the "has_any_word" arguments,
// if you do not provide argtypes it will remove duplication wherever it finds it
function CreateUniqueArguments(originalargs, originalargtypes = [""], associatedQR = [""], linkermatrix = [""]) {
    let UniqueArguments = []    
    let DuplicateWordsQR = FindDuplicateWords(associatedQR, linkermatrix)
    let UniqueWords = FindUniqueWords(originalargs)        
    

    

    for (const i in originalargs){
        if(originalargtypes[i] == "has_any_word" || originalargtypes[0] == ""){
            let NewArgument = ""     
            const SplitArguments = split_string(originalargs[i]);
            
            let ModifiedArgument = false
            for (const argumentword of SplitArguments){
                if (UniqueWords.includes(argumentword) && DuplicateWordsQR.includes(argumentword) == false){                
                    NewArgument += argumentword
                    NewArgument += " "
                }else{
                    ModifiedArgument = true
                }
            }
            if(ModifiedArgument){
                UniqueArguments.push(NewArgument.trim())
            }else{
                UniqueArguments.push(originalargs[i])
            }
            
        } else{
            UniqueArguments.push(originalargs[i])
        }                 
    }
return UniqueArguments
}

function FindUniqueWords(arr) {
    let AllWords = [];
    let UniqueWords = [];
    for (const member of arr){
        const SplitMembers = split_string(member)
        // Remove duplicate words within an argument as this will throw off the subsequent logic
        let SplitArgumentsUnique = [...new Set(SplitMembers)]
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

function FindDuplicateWords(arr, linkermatrix = "") {
    let AllWords = [];
    let DuplicateWords = [];
    let NewArr = [];

    if (linkermatrix == ""){
        NewArr = arr
    }else{
        // we may have quick replies pointing to the same argument in which case duplication is allowed. We therefore form a simplified list of quick replies based on matching arguments
        for (const row in linkermatrix){
            if(arr[row] == "tumatangging sumunod"){
                let aaa = "help"
            }
            if(/\d/.test(linkermatrix[row][0])){
                //pull in the associated argument that we should be looking at 
                let CorrectArgRef = parseInt(linkermatrix[row][1])
                if(typeof NewArr[CorrectArgRef] === 'undefined'){
                    NewArr[CorrectArgRef] = arr[row]
                }else{
                    NewArr[CorrectArgRef] += " " + arr[row] 
                }                
            }
        }
    }
    for (const member of NewArr){
        const SplitMembers = split_string(member)
        // Remove duplicate words within an argument as this will throw off the subsequent logic
        let SplitPhraseUnique = [...new Set(SplitMembers)]
        for (const argumentword of SplitPhraseUnique){
            AllWords.push(argumentword)
        }
    }
    for (const word of AllWords){
        if(CountIf(word, AllWords) > 1){
            DuplicateWords.push(word)
        }
    }
    return DuplicateWords
}

function CountIf(string, arr) {
    let counter = 0
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

function collect_Eng_qr(action){
    let EngQR = []
    for (let qr of action.quick_replies){
        EngQR.push(qr.toString().toLowerCase().trim().replace(/,/g," ").replace(/\s\s+/g, ' '))
    }
    return EngQR
}

function collect_Other_qr(EngQR, action, curr_loc, lang){
    let helper_array = []
    let TranslationLog = ''
    let MissingTranslationCount = 0

    try{
        let translation = curr_loc[lang][action.uuid].quick_replies
        for (let qr of translation){            
            let processedQR = qr.toString().toLowerCase().trim().replace(/,/g," ").replace(/\s\s+/g, ' ')
            //this checks whether the localization is translated
            if (EngQR.includes(processedQR)){
                // This catches where the localisation is still in english, we want to make a note
                MissingTranslationCount++

                //The below line prints the text id which have an incomplete translation
                TranslationLog += '        Localization present but is in English: ' + action.uuid + '\n'
                TranslationLog += '        Quick reply in question: ' + translation.toString() + '\n\n'
                
            }
            helper_array.push(processedQR)                                
        }
    }
    catch{
        // This will catch if there is no corresponding localisation ID, considering how the localization code works we should not get an error but leaving in here to be safe                                
        // if there are any missing translations in a node, we consider the node as a whole 'not translated'
        MissingTranslationCount++

        //The below line prints the text id which have an incomplete translation
        TranslationLog += '        Missing Translation in Localization: ' + action.uuid + '\n\n'

        //if there is a missing translation then we just cannot handle this node altogether
        helper_array = []
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

function create_connection_matrix(arguments,argument_types,quick_replies){
    
    // Array of argument types that should be linked
    let TextArgTypes = ["has_any_word", "has_all_words", "has_only_phrase", "has_phrase"]
    
    let connection_matrix = [];
    let argwords = [];
    let qrwords = []

    // set up an array with the arguments stored as arrays of words
    for (const index in arguments){
        argwords[index] = split_string(arguments[index])
    }

    // set up an array with the quick replies stored as arrays of words
    for (const index in quick_replies){
        qrwords[index] = split_string(quick_replies[index])
    }

    // look through the quick replies looking for matches with the arguments
    for (var i = 0; i < quick_replies.length; i++){
        
        let allmatches = []
    
        for (var k = 0; k < arguments.length; k++){
            
            if(argument_types[k] == 'has_any_word'){
                // for the has_any_word case we try to find any matching words between the arg and qr string
                for (const word of argwords[k]){
                    if(qrwords[i].includes(word)){                   
                        if (CountIf(k,allmatches) ==0){
                            allmatches.push(k)                            
                        }
                    }
                }
            }
            else if(argument_types[k] == 'has_all_words'){
                // for the has_all_words we need to check all argwords are in a particular quick reply
                n = 0
                for (const word of argwords[k]){ 
                    n++
                    if(qrwords[i].includes(word) == false){
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

function escapeRegExp(string){
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function core_argument_check(arguments,argument_types){
    let problemspresnt = false
    
    let argwords = [];

    // set up an array with the arguments stored as arrays of words
    for (const index in arguments){
        argwords[index] = split_string(arguments[index])
    }

    // look through the arguments looking for self matches
    for (const i in arguments){
        
        let countmatches = 0
    
        for (const k in arguments){
            
            if(argument_types[k] == 'has_any_word'){
                // for the has_any_word case we try to find any matching words between the arg and other args
                let matchfound = false
                for (const word of argwords[k]){ 
                    if(argwords[i].includes(word)){                        
                        matchfound = true                           
                    }                    
                }
                if(matchfound){
                    countmatches++ 
                }
            }
            else if(argument_types[k] == 'has_all_words'){
                n = 0
                // for the has_all_words we need to check all argwords are in a particular quick reply
                for (const word of argwords[k]){ 
                    n++
                    if(argwords[i].includes(word) == false){
                        break
                    }else if (n < argwords[k].length-1){
                        continue
                    }else {
                        countmatches++                                                
                    }
                }
            }
            else if(argument_types[k] == 'has_phrase'){
                // for has phrase we look for a string within a string
                if (new RegExp(arguments[k], 'i').test(arguments[i])) {
                    countmatches++                    
                }
            }
            else if(argument_types[k] == 'has_only_phrase'){
                // for has_only_phrase we look for a complete match
                if (arguments[k].trim() == arguments[i].trim()){
                    countmatches++                    
                }
            }
            
        }

        if(countmatches>1){
            problemspresnt = true
        }            
    }

    return problemspresnt

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

function multi_match_arguments(arr){
    let error = false
    let argumentrefs = []
    // Form an array of all the arguments refs in the linker matrix
    for(const member of arr){
        for(const item of member[1]){
            argumentrefs.push(item)
        }        
    }

    // Now check if there are any duplicates in the argument refs
    // Process the refs to remove duplicated
    let argumentrefsunique = [...new Set(argumentrefs)]

    //If their were duplicates we can find out by comparing the lengths of the matrices
    if(argumentrefs.length != argumentrefsunique.length){
        error = true
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



function split_string(string) {
    try{
        if(/[a-zA-Z]/.test(string)){
            return string.split(/[\s,\-\\/()!.:;]+/).filter((i) => i);
        }else{
            return string.split(/[\s,\\/()!.:;]+/).filter((i) => i);
        }  
    }catch{
        return []
    }    
}

module.exports = {
    CreateUniqueArguments,
    CountIf,
    arrayEquals,
    findlanguages,
    split_string,
    array_replace,
    collect_Eng_arguments,
    collect_Other_arguments,
    collect_Eng_qr,
    collect_Other_qr,
    retrieve_arguments,
    create_connection_matrix,
    core_argument_check,
    basic_error_check,
    no_match_matrix,
    multi_match_arguments
};
