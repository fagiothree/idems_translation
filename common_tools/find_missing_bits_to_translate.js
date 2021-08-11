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



module.exports = {
    findMissing
};