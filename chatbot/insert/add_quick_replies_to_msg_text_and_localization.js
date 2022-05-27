function move_quick_replies_to_message_text(flows, select_phrases,add_selectors) {
    const exceptions = [
        'no',
        'prefer not to say',
        'prefer not to answer',
        'prefer not to tell',
        'i prefer not to tell',
        'does not apply',
        'go back to the previous options',
        'i am not interested'
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

        for (const node of flow.nodes) {
            for (const action of node.actions) {
                if (action.type == 'send_msg') {
                    if (action.quick_replies.length > 0) {
                        let quick_replies = augment_quick_replies(action, exceptions, curr_loc);
                        
                        add_quick_replies_to_msg_text(action, quick_replies, curr_loc, select_phrases);
                        
                        clear_quick_replies(action, curr_loc, quick_replies,add_selectors);
                        
                        debug = modify_router_node_cases(flow, node, action, curr_loc, quick_replies, routers, debug, debug_lang);
                        
                    }
                }
            }
        }
    }

    return [flows, debug, debug_lang];
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
        
            translations[lang] = messages[curr_act.uuid].quick_replies[i];
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

function clear_quick_replies(action, curr_loc, quick_replies, add_selectors) {
    action.quick_replies = [];
    for (const lang in curr_loc) {
        curr_loc[lang][action.uuid].quick_replies = [];
    }
    if (add_selectors){
        quick_replies.forEach(qr => {
            action.quick_replies.push(String(qr.selector));
            for (const lang in curr_loc) {
                curr_loc[lang][action.uuid].quick_replies.push(String(qr.selector));
            }
        });
    }
}

function modify_router_node_cases(flow, node, action, curr_loc, quick_replies, routers, debug, debug_lang) {
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

            if (curr_case.type === 'has_any_word') {
                // save the list of arguments in a list (it's a list of 1 string)
                let arg_list = split_args(curr_case.arguments[0]);
                let old_test = arg_list.join(",") + ",";
                let new_test = arg_list.join(",") + ",";

                // variable to check if the matching between arguments and quick replies is consistent across languages
                let matching_selectors = new Set();

                // find matching quick reply
                for (let arg of arg_list) {
                    
                    debug += `arg: ${arg}\n`;
                    //let r_exp = new RegExp(`\\b${arg}\\b`, "i");
                    let r_exp = new RegExp(`\\b${arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");

                    for (let quick_reply of quick_replies) {
                        if (r_exp.test(quick_reply.text)) {
                            new_test += quick_reply.selector + ",";
                            matching_selectors.add(quick_reply.selector);
                            debug += new_test + '\n';
                        }
                    }
                }

                if (new_test == old_test) {
                    //console.log(`no match main version in flow ${flow.name}`);
                    debug += 'NO MATCH \n';
                }
                else {
                    curr_case.arguments = [new_test];
                }

                const unique_selectors = Array.from(matching_selectors).sort().join(',');

                // do the same for the languages in localiz
                let arg_list_lang = {};
                let old_test_lang = {};
                let new_test_lang = {};
                let matching_selectors_lang = {};

                debug += `arg list: ${arg_list}\n`;

                for (const [lang, messages] of Object.entries(curr_loc)) {
                    arg_list_lang[lang] = split_args(messages[case_id].arguments[0]);
                    old_test_lang[lang] = arg_list_lang[lang].join(",") + ",";
                    new_test_lang[lang] = arg_list_lang[lang].join(",") + ",";
                    matching_selectors_lang[lang] = new Set();

                    debug_lang[lang] += `arg list: ${arg_list_lang[lang]}\n`;

                    // find matching quick reply in localization
                    for (let arg of arg_list_lang[lang]) {
                       
                        debug_lang[lang] += `arg: ${arg}\n`;
                        
                        let r_exp = new RegExp(`\\b${arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                        

                        for (let quick_reply of quick_replies) {
                            if (r_exp.test(quick_reply.translations[lang])) {
                                new_test_lang[lang] += quick_reply.selector + ',';
                                matching_selectors_lang[lang].add(quick_reply.selector);
                                debug_lang[lang] += new_test_lang[lang] + '\n';
                            }
                        }
                    }

                    if (new_test_lang[lang] == old_test_lang[lang]) {
                        //console.log(`no match ${lang} in flow ${flow.name}`);
                        debug_lang[lang] += 'NO MATCH \n';
                    }

                    const unique_selectors_lang = Array.from(matching_selectors_lang[lang]).sort().join(',');
                    if (unique_selectors != unique_selectors_lang) {
                        //console.log(` in flow ${flow.name} no matching selectors original ${matching_selectors} and ${lang} ${matching_selectors_lang[lang]}`);
                        debug_lang[lang] += 'NO MATCHING SELECTORS \n';
                    }

                    if (new_test_lang[lang] != old_test_lang[lang] && unique_selectors == unique_selectors_lang) {
                        messages[case_id].arguments = [new_test_lang[lang]];
                    }
                }
            }
            else if (curr_case.type === 'has_all_words') {
                let arg_list = split_args(curr_case.arguments[0]);
                let new_test = '';

                // find matching qr
                for (const quick_reply of quick_replies) {
                    const match_all = arg_list.every(
                        (word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(quick_reply.text)
                        //word) => new RegExp(word, 'i').test(quick_reply.text)
                    );

                    if (match_all) {
                        new_test += quick_reply.selector + ',';
                    }
                }

                if (new_test === '') {
                    //console.log(`no match ${flow.name}`);
                    debug += 'NO MATCH \n';
                }
                else {
                    curr_case.arguments = [new_test];
                }

                // do the same for the languages in localiz
                let arg_list_lang = {};
                let new_test_lang = {};

                debug += `arg list: ${arg_list}\n`;

                for (const [lang, messages] in Object.entries(curr_loc)) {
                    arg_list_lang[lang] = split_args(messages[case_id].arguments[0]);
                    new_test_lang[lang] = '';

                    debug_lang[lang] += `arg list: ${arg_list_lang[lang]}\n`;

                    // find matching quick reply in localization
                    for (const quick_reply of quick_replies) {
                        const match_all = arg_list_lang[lang].every(                           
                            (word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(quick_reply.translations[lang])
                            //(word) => new RegExp(word, 'i').test(quick_reply.translations[lang])
                        );

                        if (match_all) {
                            new_test_lang[lang] += quick_reply.selector + ',';
                        }
                    }

                    if (new_test_lang[lang] === '') {
                        //console.log(`no match msa ${flow.name}`);
                        debug_lang[lang] += 'NO MATCH \n';
                    }

                    if (new_test_lang[lang] != new_test) {
                        //console.log(` in flow ${flow.name} no matching selectors`);
                        debug_lang[lang] += 'NO MATCHING SELECTORS \n';
                    }

                    if (new_test_lang[lang] != '' && new_test_lang[lang] == new_test) {
                        messages[case_id].arguments = [new_test_lang[lang]];
                    }
                }
            }
            else if (curr_case.type === 'has_phrase') {
                let arg = curr_case.arguments[0];
                let new_test = '';
                debug = `arg: ${arg}\n`;

                // find matching qr
                for (const quick_reply of quick_replies) {
                    //if (new RegExp(arg, 'i').test(quick_reply.text)) {
                    if (new RegExp(arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(quick_reply.text)) {
                        new_test += quick_reply.selector + ',';
                    }

                }

                if (new_test === '') {
                    //console.log(`no match ${flow.name}`);
                    debug += 'NO MATCH \n';
                }
                else {
                    curr_case.arguments = [new_test];
                }

                // do the same for the languages in localiz
                let arg_lang = {};
                let new_test_lang = {};

                for (const [lang, messages] of Object.entries(curr_loc)) {
                    arg_lang[lang] = messages[case_id].arguments[0];
                    new_test_lang[lang] = '';
                    debug_lang[lang] += `arg: ${arg_lang[lang]}\n`;

                    // find matching quick reply in localization
                    for (const quick_reply of quick_replies) {
                        //if (new RegExp(arg, 'i').test(quick_reply.translations[lang])) {
                        if (new RegExp(arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(quick_reply.translations[lang])) {
                            new_test_lang[lang] += quick_reply.selector + ',';
                        }
                    }

                    if (new_test_lang[lang] === '') {
                        //console.log(`no match msa ${flow.name}`);
                        debug_lang[lang] += 'NO MATCH \n';
                    }

                    if (new_test_lang[lang] != new_test) {
                        //console.log(` in flow ${flow.name} no matching selectors`);
                        debug_lang[lang] += 'NO MATCHING SELECTORS \n';
                    }

                    if (new_test_lang[lang] !== '' && new_test_lang[lang] == new_test) {
                        messages[case_id].arguments = [new_test_lang[lang]];
                    }
                }
            }
            else if (curr_case.type === 'has_only_phrase') {
                let arg = curr_case.arguments[0];
                
                debug += `arg: ${arg}\n`;
                let new_test = '';

                // find matching qr
                for (const quick_reply of quick_replies) {
                    if (quick_reply.text.toLowerCase().trim() == arg.toLowerCase().trim()) {
                        new_test += quick_reply.selector + ',';
                        debug += new_test + '\n';
                    }
                }

                if (new_test === '') {
                    debug += 'NO MATCH \n';
                    //console.log(`no match ${flow.name}`);
                }
                else {
                    curr_case.arguments = [new_test];
                }

                // do the same for the languages in localiz
                let arg_lang = {};
                let new_test_lang = {};

                for (const [lang, messages] of Object.entries(curr_loc)) {
                    arg_lang[lang] = messages[case_id].arguments[0];
                    new_test_lang[lang] = '';
                    debug_lang[lang] += `arg: ${arg_lang[lang]}\n`;

                    // find matching quick reply in localization
                    for (const quick_reply of quick_replies) {
                        if (quick_reply.translations[lang].toLowerCase().trim() == arg_lang[lang].toLowerCase().trim()) {
                            new_test_lang[lang] += quick_reply.selector + ',';
                            debug_lang[lang] += new_test_lang[lang] + '\n';
                        }
                    }

                    if (new_test_lang[lang] === '') {
                        //console.log('no match msa' + flow.name);
                        debug_lang[lang] += 'NO MATCH \n';
                    }

                    if (new_test_lang[lang] != new_test) {
                        //console.log(` in flow ${flow.name} no matching selectors`);
                        debug_lang[lang] += 'NO MATCHING SELECTORS \n';
                    }

                    if (new_test_lang[lang] !== '' && new_test_lang[lang] == new_test) {
                        messages[case_id].arguments = [new_test_lang[lang]];
                    }
                }
            }
            curr_case.type = 'has_any_word';
        }
    }
    return debug
}

function split_args(args) {
    return args.split(/[\s,]+/).filter((i) => i);
}

module.exports = {
    move_quick_replies_to_message_text
};
