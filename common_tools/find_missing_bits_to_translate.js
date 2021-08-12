function findMissing(curr_list,curr_transl_dict){
    let missing_bits = [];
    curr_list.forEach(bit => {
        let same_text = curr_transl_dict.filter(t_bit => t_bit.SourceText == bit.SourceText)
        if (same_text.length == 0){
            missing_bits.push(bit)
        }
    });

    return missing_bits
}

function countMissing(missing_bits){
    let word_count = 0;
    missing_bits.forEach(bit =>{
        let n_words = bit.SourceText.split(" ").length;
        word_count = word_count + n_words;
    })

    return word_count
}



module.exports = {
    findMissing,
    countMissing
};