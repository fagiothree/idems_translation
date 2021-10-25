// Area to start breaking down translation process into a set of reusable functions

//Function takes a set of arguments and attempts to produce a set with no common words. If you provide argtypes it will only replace the "has_any_word" arguments,
// if you do not provide argtypes it will remove duplication wherever it finds it
function CreateUniqueArguments(originalargs, originalargtypes = [""]) {
    var UniqueArguments = []
    var UniqueWords = FindUniqueWords(originalargs)
    let arrayLength = originalargs.length;

    for (let i = 0 ; i < arrayLength; i++){
        if(originalargtypes[i] == "has_any_word" || originalargtypes[0] == ""){
            let NewArgument = ""     
            const SplitArguments = originalargs[i].split(" ");
            for (const argumentword of SplitArguments){
                if (CountIf(argumentword,UniqueWords) == 1){                
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
        const SplitArguments = argument.split(" ")
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

module.exports = {
    CreateUniqueArguments,
    arrayEquals
};
