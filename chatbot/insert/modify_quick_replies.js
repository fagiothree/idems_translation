const fs = require('fs'); 

// Code for running local tests on function - leave in place
// let filePath = "C:/Users/edmun/Code/idems_translation/chatbot/test/Other_Test_files/NEXT_replace_test.json"
// let obj = JSON.parse(fs.readFileSync(filePath).toString());
// const [a, b, c] = move_and_modidy_qr_to_message_text(obj, "./test/Input/select_phrases.json", "./test/Input/replace_phrases.json", "No", 100,"./test/Input/special_words.json")

function move_quick_replies_to_message_text(flows, select_phrases, add_selectors, qr_limit, special_words) {
    
    const exceptions = [
        'no',
        'prefer not to say',
        'prefer not to answer',
        'prefer not to tell',
        'i prefer not to tell',
        'does not apply',
        'go back to the previous options',
        'i am not interested',
        'no i do not agree'
    ];

    let debug = '';
    let debug_lang = {};
    if (!select_phrases.hasOwnProperty("eng")){
        select_phrases["eng"] = "Please select the number for the following options:"
    }
 
    for (const flow of flows.flows) {
        
        let curr_loc = flow.localization;

        debug += `\n\n${flow.name}*************************************\n`;
        for (const lang in curr_loc) {
            
            if (debug_lang.hasOwnProperty(lang)){
                debug_lang[lang] += `\n\n${flow.name}*************************************\n`;
            }else{
                debug_lang[lang] = `${flow.name}*************************************\n`;
            }
 
        }

        const routers = flow.nodes
            .filter((node) => node.router && node.router.operand === '@input.text')
            .reduce(
                (acc, node) => {
                    acc[node.uuid] = node;
                    return acc;
                },
                {}
            );
        
        let routers_edited = []

        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    if (action.quick_replies.length > 0) {
                        let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                        
                        add_quick_replies_to_msg_text(action, quick_replies, curr_loc, select_phrases);
                        
                        clear_quick_replies(node, routers, action, curr_loc, quick_replies, add_selectors, special_words, debug, debug_lang, qr_limit);
                        
                        modify_router_node_cases(node, action, curr_loc, quick_replies, routers, debug, debug_lang, routers_edited);
                        
                    }
                }
            }
        }
    }

    return [flows, debug, debug_lang];
}

function move_and_modidy_qr_to_message_text(flows, select_phrases, replace_phrases, add_selectors, qr_limit, special_words) {
    
    const exceptions = [
        'no',
        'prefer not to say',
        'prefer not to answer',
        'prefer not to tell',
        'i prefer not to tell',
        'does not apply',
        'go back to the previous options',
        'i am not interested',
        'no i do not agree'
    ];

    let debug = '';
    let debug_lang = {};
    if (!select_phrases.hasOwnProperty("eng")){
        select_phrases["eng"] = "Please select the number for the following options:"
    }
 
    for (const flow of flows.flows) {
        
        let curr_loc = flow.localization;

        debug += `\n\n${flow.name}*************************************\n`;
        for (const lang in curr_loc) {
            
            if (debug_lang.hasOwnProperty(lang)){
                debug_lang[lang] += `\n\n${flow.name}*************************************\n`;
            }else{
                debug_lang[lang] = `${flow.name}*************************************\n`;
            }
 
        }

        const routers = flow.nodes
            .filter((node) => node.router && node.router.operand === '@input.text')
            .reduce(
                (acc, node) => {
                    acc[node.uuid] = node;
                    return acc;
                },
                {}
            );
        
        let routers_edited = []

        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    if (action.quick_replies.length > 0) {
                        let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                        
                        add_and_modify_qr_to_msg_text(action, quick_replies, curr_loc, select_phrases, replace_phrases);
                        
                        clear_quick_replies(node, routers, action, curr_loc, quick_replies, add_selectors, special_words, debug, debug_lang, qr_limit);
                        
                        modify_router_node_cases(node, action, curr_loc, quick_replies, routers, debug, debug_lang, routers_edited);
                        
                    }
                }
            }
        }
    }

    return [flows, debug, debug_lang];
}

function reformat_quick_replies(flows, select_phrases, count_threshold, length_threshold, qr_limit ,special_words) {
    
    const exceptions = [
        'no',
        'prefer not to say',
        'prefer not to answer',
        'prefer not to tell',
        'i prefer not to tell',
        'does not apply',
        'go back to the previous options',
        'i am not interested',
        'no i do not agree'
    ];

    let debug = '';
    let debug_lang = {};
    if (!select_phrases.hasOwnProperty("eng")){
        select_phrases["eng"] = "Please select the number for the following options:"
    }
 
    for (const flow of flows.flows) {
        
        let curr_loc = flow.localization;

        debug += `\n\n${flow.name}*************************************\n`;
        for (const lang in curr_loc) {
            
            if (debug_lang.hasOwnProperty(lang)){
                debug_lang[lang] += `\n\n${flow.name}*************************************\n`;
            }else{
                debug_lang[lang] = `${flow.name}*************************************\n`;
            }
 
        }

        const routers = flow.nodes
            .filter((node) => node.router && node.router.operand === '@input.text')
            .reduce(
                (acc, node) => {
                    acc[node.uuid] = node;
                    return acc;
                },
                {}
            );
        
        let routers_edited = []

        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    qr_count = action.quick_replies.length
                    if (qr_count > 1) { 
                        if(not_contains_numeric_value(action.quick_replies)){
                            let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                            let max_qr_length = find_max_length(quick_replies)
                            if(qr_count > count_threshold || max_qr_length > length_threshold){
                            
                                add_quick_replies_to_msg_text(action, quick_replies, curr_loc, select_phrases);
                                
                                clear_quick_replies(node, routers, action, curr_loc, quick_replies, "yes", special_words, debug, debug_lang, qr_limit);
                                
                                modify_router_node_cases(node, action, curr_loc, quick_replies, routers, debug, debug_lang, routers_edited);
                            }  
                        }                            
                    }
                }
            }
        }
    }

    return [flows, debug, debug_lang];
}

function reformat_quick_replies_china(flows, select_phrases, count_threshold, length_threshold, qr_limit ,special_words) {
    
    const exceptions = [
        'no',
        'prefer not to say',
        'prefer not to answer',
        'prefer not to tell',
        'i prefer not to tell',
        'does not apply',
        'go back to the previous options',
        'i am not interested',
        'no i do not agree'
    ];

    let debug = '';
    let debug_lang = {};
    if (!select_phrases.hasOwnProperty("eng")){
        select_phrases["eng"] = "Please select the number for the following options:"
    }
 
    for (const flow of flows.flows) {
        
        let curr_loc = flow.localization;

        debug += `\n\n${flow.name}*************************************\n`;
        for (const lang in curr_loc) {
            
            if (debug_lang.hasOwnProperty(lang)){
                debug_lang[lang] += `\n\n${flow.name}*************************************\n`;
            }else{
                debug_lang[lang] = `${flow.name}*************************************\n`;
            }
 
        }

        const routers = flow.nodes
            .filter((node) => node.router && node.router.operand === '@input.text')
            .reduce(
                (acc, node) => {
                    acc[node.uuid] = node;
                    return acc;
                },
                {}
            );
        
        let routers_edited = []

        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    qr_count = action.quick_replies.length
                    if (qr_count > 1) { 
                        if(not_contains_numeric_value(action.quick_replies)){
                            let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                            let max_qr_length = find_max_length(quick_replies)
                            if(qr_count > count_threshold || max_qr_length > length_threshold){
                            
                                add_quick_replies_to_msg_text(action, quick_replies, curr_loc, select_phrases);
                                
                                clear_quick_replies(node, routers, action, curr_loc, quick_replies, "no", special_words, debug, debug_lang, qr_limit);
                                
                                modify_router_node_cases(node, action, curr_loc, quick_replies, routers, debug, debug_lang, routers_edited);
                            }  
                        }                            
                    } else if (qr_count = 1) { 
                        let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                          
                        add_quick_replies_to_msg_text_html(action, quick_replies, curr_loc);
                        
                        clear_quick_replies(node, routers, action, curr_loc, quick_replies, "no");                                          
                    }
                }
            }
        }
    }

    return [flows, debug, debug_lang];
}

function convert_qr_to_html(flows) {

    const exceptions = []
    let debug = '';
    let debug_lang = {};    
 
    for (const flow of flows.flows) {
        
        let curr_loc = flow.localization;

        debug += `\n\n${flow.name}*************************************\n`;
        for (const lang in curr_loc) {
            
            if (debug_lang.hasOwnProperty(lang)){
                debug_lang[lang] += `\n\n${flow.name}*************************************\n`;
            }else{
                debug_lang[lang] = `${flow.name}*************************************\n`;
            }
 
        }
        
        const routers = []

        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    qr_count = action.quick_replies.length
                    if (qr_count > 0) { 
                            let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                              
                            add_quick_replies_to_msg_text_html(action, quick_replies, curr_loc);
                            
                            clear_quick_replies(node, routers, action, curr_loc, quick_replies, "no");                                          
                    }
                }
            }
        }
    }

    return [flows, debug, debug_lang];
}

function find_max_length(inputArray) {
    let maxLength = 0;
  
    inputArray.forEach(item => {
      // Calculate the length of the English text and update the maxLength if needed
      maxLength = Math.max(maxLength, item.text.length);
  
      // Calculate the maximum length for each translation and update maxLength if needed
      for (const translation of Object.values(item.translations)) {
        maxLength = Math.max(maxLength, translation.length);
      }
    });
  
    return maxLength;
  }

function augment_quick_replies(curr_act, exceptions, curr_loc) {
 
    return curr_act.quick_replies.map((qr, i, qrs) => {
        let selector = i + 1;
        if (i == qrs.length - 1
            && (i == 9 || exceptions.includes(qr.toLowerCase().trim()))) {
            selector = 0;
        }

        let translations = {};
        
        for (const [lang, messages] of Object.entries(curr_loc)) {

            if (messages[curr_act.uuid]){
                translations[lang] = messages[curr_act.uuid].quick_replies[i];
            }else{
                translations[lang] = ""
            }         
        }

        return {
            selector,
            text: qr,
            translations
        };
    });
}

function add_quick_replies_to_msg_text(action, quick_replies, curr_loc, select_phrases) {
    action.text = [
        action.text,
        '\n' + select_phrases["eng"],
        ...quick_replies.map((qr) => `${qr.selector}. ${qr.text}`)
    ].join('\n');

    for (const [lang, translations] of Object.entries(curr_loc)) {
        translations[action.uuid].text[0] = [
            translations[action.uuid].text[0],
            '\n' + select_phrases[lang],
            ...quick_replies.map((qr) => `${qr.selector}. ${qr.translations[lang]}`)
        ].join('\n');
    }
}

function add_and_modify_qr_to_msg_text(action, quick_replies, curr_loc, select_phrases, replace_phrases) {

    qr_count = action.quick_replies.length
    first_qr_text = action.quick_replies[0]

    if (qr_count == 1 && replace_phrases.hasOwnProperty(first_qr_text)){
        action.text = [
            action.text,
            '\n' + replace_phrases[first_qr_text]["eng"]
        ].join('\n');

        for (const [lang, translations] of Object.entries(curr_loc)) {
            translations[action.uuid].text[0] = [
                translations[action.uuid].text[0],
                '\n' + replace_phrases[first_qr_text][lang]
            ].join('\n');
        }

    }else{
        action.text = [
            action.text,
            '\n' + select_phrases["eng"],
            ...quick_replies.map((qr) => `${qr.selector}. ${qr.text}`)
        ].join('\n');

        for (const [lang, translations] of Object.entries(curr_loc)) {
            translations[action.uuid].text[0] = [
                translations[action.uuid].text[0],
                '\n' + select_phrases[lang],
                ...quick_replies.map((qr) => `${qr.selector}. ${qr.translations[lang]}`)
            ].join('\n');
        }
    }
}

function add_quick_replies_to_msg_text_html(action, quick_replies, curr_loc) {
    const formatQuickReplyLink = (text) => `<a href="weixin://bizmsgmenu?msgmenucontent=${text}&msgmenuid=a">${text}</a>`;
    action.text = [
        action.text,
        ...quick_replies.map((qr) => formatQuickReplyLink(qr.text))
    ].join('\n\n');

    for (const [lang, translations] of Object.entries(curr_loc)) {
        translations[action.uuid].text[0] = [
            translations[action.uuid].text[0],
            ...quick_replies.map((qr) => formatQuickReplyLink(qr.translations[lang]))
        ].join('\n\n');
    }
}

function clear_quick_replies(node, routers, action, curr_loc, quick_replies, add_selectors, special_words, debug, debug_lang, qr_limit = 100) {
    // id of corresponding wait for response node

    const dest_id = node.exits[0].destination_uuid;
    let router = routers[dest_id];

    action.quick_replies = [];
    for (const lang in curr_loc) {
        curr_loc[lang][action.uuid].quick_replies = [];
    }
    
    if (add_selectors == "yes" && quick_replies.length <= qr_limit){
        quick_replies.forEach(qr => {

            arg_type = retrieve_argument_type(qr.text, router)

            if(special_words.eng){
                if (special_words.eng.includes(qr.text)){
                    if(arg_type == 'has_any_word'){
                        action.quick_replies.push(String(qr.text));
                    }else{
                        debug += `\nQuick reply '${qr.text}' was present in 'special_words' but could not be instigated here as it is not associated with a 'has_any_word' argument type\n`;
                        action.quick_replies.push(String(qr.selector));    
                    }
                } else {
                    action.quick_replies.push(String(qr.selector));                
                }
            }else{
                action.quick_replies.push(String(qr.selector));
            }                    
            
            for (const lang in curr_loc) {
                if (special_words[lang] && special_words[lang].includes(qr.translations[lang])){
                    if(arg_type == 'has_any_word'){
                        curr_loc[lang][action.uuid].quick_replies.push(String(qr.translations[lang]));
                    }else{
                        debug_lang[lang] += `\nQuick reply '${qr.translations[lang]}' was present in 'special_words' but could not be instigated here as it is not associated with a 'has_any_word' argument type\n`;
                        curr_loc[lang][action.uuid].quick_replies.push(String(qr.selector));
                    }  
                } else {
                    curr_loc[lang][action.uuid].quick_replies.push(String(qr.selector));                
                }
            }            
        });
    }
}

function modify_router_node_cases(node, action, curr_loc, quick_replies, routers, debug, debug_lang, routers_edited) {
    // id of corresponding wait for response node
    const dest_id = node.exits[0].destination_uuid;

    // TO DO: what happens if there is a node between the send_msg node and the wfr node???
    debug += `\n${action.text}\n`;
    for (const lang in curr_loc) {
        debug_lang[lang] += `\n${curr_loc[lang][action.uuid].text[0]}\n`;
    }

    let router = routers[dest_id];
    if (router) {
        
        for (let curr_case of router.router.cases) {
            const case_id = curr_case.uuid;

            let arg = curr_case.arguments[0]
            let arg_type = curr_case.type

            // get a new argument which works with our new numeric quick replies
            let [new_arg, selectors] = find_new_argument(arg, arg_type, quick_replies)

            if (new_arg == "") {
                debug += arg + ' - NO MATCHING QR \n';
            }
            else {
                curr_case.arguments = [new_arg];
            }

            // complete the same process for the corresponding translation arguments
            for (const [lang, messages] of Object.entries(curr_loc)) {
                arg_lang = messages[case_id].arguments[0];
                let [new_arg_lang, selectors_lang] = find_new_argument(arg_lang, arg_type, quick_replies, lang)

                if (new_arg_lang == "") {
                    if(routers_edited.includes(dest_id)){
                        debug_lang[lang] += arg_lang + ' - This wfr node has multiple nodes going into it, this is not the first time it has been processed, the arguments have already been modified\n';
                    }else{
                        debug_lang[lang] += arg_lang + ' - NO MATCHING QR \n';
                    }
                    
                }else if(selectors != selectors_lang){
                    debug_lang[lang] += 'Translation relationship does not match english version \n';
                }
                else {
                    messages[case_id].arguments = [new_arg_lang];
                }
            }
            
            curr_case.type = 'has_any_word';
            
        }
    }
    routers_edited.push(dest_id)
}

function retrieve_argument_type(qrtext, router){
    let argument_type = ""
    if (router) {
        
        for (let curr_case of router.router.cases) {

            let arg = curr_case.arguments[0]
            let arg_type = curr_case.type

            if(arg_qr_match(arg, arg_type, qrtext)){
                argument_type += arg_type                
            }
        }
    }
    return argument_type
}

function find_new_argument(argument, arg_type, quick_replies, lang = false){
    
    let matching_selectors = new Set();
    
    let arg = argument.toLowerCase()
    let new_arg = "" 

    for (let quick_reply of quick_replies){

        if (lang == false){
            qrtext = quick_reply.text.toLowerCase()
        }else{
            qrtext = quick_reply.translations[lang].toLowerCase()
        }
        
        if(arg_qr_match(arg, arg_type, qrtext)){
            if(arg_type == 'has_any_word'){
                new_arg += arg + "," + quick_reply.selector + ","
            }else{
                new_arg += quick_reply.selector + ","
            }
            matching_selectors.add(quick_reply.selector)
        }  
    }

    let unique_selectors = Array.from(matching_selectors).sort().join(',')

    return [new_arg, unique_selectors]
}

function arg_qr_match(argument, arg_type, quick_reply_text){
    let arg = argument.toLowerCase()
    let qrtext = quick_reply_text.toLowerCase()
    let argwords = split_string(arg)
    let qrwords = split_string(qrtext)

    if(arg_type == 'has_any_word'){
        for (const word of argwords){
            if(qrwords.includes(word)){                   
                return true
            }
        }
    }
    else if(arg_type == 'has_all_words'){
        for (const word of argwords){ 
            if(qrwords.includes(word)){
                match_result = true    
            }else {
                match_result = false
                break                                               
            }
        }
        if (match_result){
            return true
        }
    }
    else if(arg_type == 'has_phrase'){
        if (new RegExp(arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'iu').test(qrtext)) {
            return true                   
        }
    }
    else if(arg_type == 'has_only_phrase'){
        if (arg.trim() == qrtext.trim()){
            return true                    
        }
    }
}

function split_string(args) {
    return args.split(/[\s,]+/).filter((i) => i);
}

function not_contains_numeric_value(list) {
    for (const item of list) {
      if (typeof item === 'number') {
        return false;
      }
    }
    return true;
  }

module.exports = {
    move_quick_replies_to_message_text,
    move_and_modidy_qr_to_message_text,
    reformat_quick_replies,
    reformat_quick_replies_china,
    convert_qr_to_html
};
