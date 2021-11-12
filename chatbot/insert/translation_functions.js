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


module.exports = {
    CreateUniqueArguments,
    CountIf,
    arrayEquals,
    findlanguages,
    split_args,
    array_replace
};
