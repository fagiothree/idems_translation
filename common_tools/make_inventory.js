const stringSimilarity = require("string-similarity");


function findBestMatch(missing_bits,curr_transl_dict){
    let best_matches = [];
    let list_of_transl = [];
    curr_transl_dict.forEach(t_bit => {list_of_transl.push(t_bit["SourceText"])});

    missing_bits.forEach(bit =>{
        let couple ={};
        let best_match = stringSimilarity.findBestMatch(bit["SourceText"], list_of_transl);
        if (best_match.bestMatch.rating>=0.8){
            couple["missing"] = bit["SourceText"];
            couple["best-match"] = curr_transl_dict[best_match.bestMatchIndex].SourceText; //best_match.bestMatch.target;
            couple["transl"] = curr_transl_dict[best_match.bestMatchIndex].text;
            couple["bit"] = bit;
            couple.bit.text = couple.transl;
            best_matches.push(couple);
        }
       
    })
    
    return best_matches
}

function addRestoredToTranslationDictionary(selected_best_matches,curr_transl_dict){
    let new_transl_dict = curr_transl_dict;
    
    selected_best_matches.forEach(missing_bit => {
        if (missing_bit.bit.text != ""){
            new_transl_dict.push(missing_bit.bit)
        }
        
    });
    

    return new_transl_dict
}


module.exports = {
    findBestMatch,
    addRestoredToTranslationDictionary
};


