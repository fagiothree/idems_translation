var fs = require('fs');
var path = require("path");
var input_path = path.join(__dirname, "../../flavour/Malaysia/output/plh_malaysia_flavour_msa.json");

var json_string = fs.readFileSync(input_path).toString();
var obj = JSON.parse(json_string);

// var count = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

var exceptions = ["no", "prefer not to say", "prefer not to answer", "prefer not to tell", "i prefer not to tell", "does not apply", "go back to the previous options"];


var debug = "";
var debug_lang = {};
debug_lang.msa = "";

var select_phrase_msa = "Sila pilih nombor bagi pilihan berikut:";
var select_phrases = {};
select_phrases.msa = select_phrase_msa;

for (var fl = 0; fl < obj.flows.length; fl++) {
    //console.log(obj.flows[fl].name + "*************************************")
    var curr_loc = obj.flows[fl].localization;

    debug = debug + "\n\n" + obj.flows[fl].name + "*************************************" + "\n";
    for (lang in curr_loc) {
        debug_lang[lang] = debug_lang[lang] + "\n\n" + obj.flows[fl].name + "*************************************" + "\n";
    }



    for (var nd = 0; nd < obj.flows[fl].nodes.length; nd++) {
        for (var ac = 0; ac < obj.flows[fl].nodes[nd].actions.length; ac++) {
            var curr_act = obj.flows[fl].nodes[nd].actions[ac];
            var act_id = curr_act.uuid;

            if (curr_act.type == "send_msg") {
                if (curr_act.quick_replies.length > 0) {

                    // add selection phrase to message text
                    obj.flows[fl].nodes[nd].actions[ac].text = obj.flows[fl].nodes[nd].actions[ac].text + "\n\n" + "Please select the number for the following options:";

                    // do the same for each language in localization
                    for (lang in curr_loc) {
                        obj.flows[fl].localization[lang][act_id].text = obj.flows[fl].localization[lang][act_id].text + "\n\n" + select_phrases[lang];
                    }

                    // save in a list selectors to be used with the quick replies
                    var selectors = [];
                    for (qr = 0; qr < curr_act.quick_replies.length; qr++) {
                        // letters
                        //obj.flows[fl].nodes[nd].actions[ac].text = obj.flows[fl].nodes[nd].actions[ac].text + "\n" + count[qr] + ". " + curr_act.quick_replies[qr];

                        // decreasing numbers
                        //selectors.push(curr_act.quick_replies.length - qr -1);

                        //increasing numbers with 0s
                        if (qr == curr_act.quick_replies.length - 1) {
                            if (qr == 9 || exceptions.includes(curr_act.quick_replies[qr].toLowerCase().trim())) {
                                selectors.push(0)
                            } else {
                                selectors.push(qr + 1);
                            }
                        } else {
                            selectors.push(qr + 1);
                        }

                        // add quick reply and corresponding selector to msg text
                        obj.flows[fl].nodes[nd].actions[ac].text = obj.flows[fl].nodes[nd].actions[ac].text + "\n" + selectors[qr] + ". " + curr_act.quick_replies[qr];

                        // do the same for each language in the localization (using the same selectors, since the order of quick replies is the same) 
                        for (lang in curr_loc) {
                            obj.flows[fl].localization[lang][act_id].text = obj.flows[fl].localization[lang][act_id].text + "\n" + selectors[qr] + ". " + curr_loc[lang][act_id].quick_replies[qr];
                        }


                    }
                    // store quick replies before replacing with empty list
                    var curr_quick_replies = obj.flows[fl].nodes[nd].actions[ac].quick_replies;
                    var curr_transl_quick_replies = {};
                    for (lang in curr_loc) {
                        curr_transl_quick_replies[lang] = curr_loc[lang][act_id].quick_replies;
                    }


                    obj.flows[fl].nodes[nd].actions[ac].quick_replies = [];
                    for (lang in curr_loc) {
                        obj.flows[fl].localization[lang][act_id].quick_replies = [];
                    }


                    // id of corresponding wait for response node
                    dest_id = obj.flows[fl].nodes[nd].exits[0].destination_uuid;


                    debug = debug + "\n" + obj.flows[fl].nodes[nd].actions[ac].text + "\n";
                    for (lang in curr_loc) {
                        debug_lang[lang] = debug_lang[lang] + "\n" + obj.flows[fl].localization[lang][act_id].text + "\n";
                    }


                    for (var j = 0; j < obj.flows[fl].nodes.length; j++) {
                        if (obj.flows[fl].nodes[j].uuid == dest_id) {
                            if (obj.flows[fl].nodes[j].hasOwnProperty('router') && obj.flows[fl].nodes[j].router.operand == "@input.text") {

                                for (var c = 0; c < obj.flows[fl].nodes[j].router.cases.length; c++) {
                                    var curr_case = obj.flows[fl].nodes[j].router.cases[c];
                                    var case_id = curr_case.uuid;

                                    if (curr_case.type == "has_any_word") {

                                        // save the list of arguments in a list (it's a list of 1 string)
                                        var arg_list = obj.flows[fl].nodes[j].router.cases[c].arguments[0].split(/[\s,]+/).filter(function (i) { return i });
                                        var old_test = arg_list.join(",") + ",";
                                        var new_test = arg_list.join(",") + ",";

                                        // variable to check if the matching between arguments and quick replies is consistent across languages
                                        var matching_selectors = [];


                                        // do the same for the languages in localiz
                                        var arg_list_lang = {};
                                        var old_test_lang = {};
                                        var new_test_lang = {};
                                        var matching_selectors_lang = {};

                                        for (lang in curr_loc) {
                                            arg_list_lang[lang] = obj.flows[fl].localization[lang][case_id].arguments[0].split(/[\s,]+/).filter(function (i) { return i });
                                            old_test_lang[lang] = arg_list_lang[lang].join(",") + ",";
                                            new_test_lang[lang] = arg_list_lang[lang].join(",") + ",";
                                            matching_selectors_lang[lang] = [];
                                        }



                                        debug = debug + "arg list: " + arg_list + "\n";
                                        for (lang in curr_loc) {
                                            debug_lang[lang] = debug_lang[lang] + "arg list: " + arg_list_lang[lang] + "\n";
                                        }

                                        // find matching quick reply
                                        for (var ar = 0; ar < arg_list.length; ar++) {

                                            arg = arg_list[ar];
                                            debug = debug + "arg: " + arg + "\n";
                                            r_exp = new RegExp(`\\b${arg}\\b`, "i");

                                            for (var qr = 0; qr < curr_quick_replies.length; qr++) {
                                                quick_reply = curr_quick_replies[qr];

                                                if (r_exp.test(quick_reply)) {
                                                    // new_test = new_test + count[qr] + ",";
                                                    new_test = new_test + selectors[qr] + ",";
                                                    if (!matching_selectors.includes(selectors[qr])) {
                                                        matching_selectors.push(selectors[qr]);

                                                    }
                                                    debug = debug + new_test + "\n";
                                                }
                                            }
                                        }

                                        if (new_test == old_test) {
                                            console.log("no match main version in flow " + obj.flows[fl].name)
                                            debug = debug + "NO MATCH " + "\n";
                                        }
                                        else {
                                            obj.flows[fl].nodes[j].router.cases[c].arguments = [new_test];

                                        }


                                        // find matching quick reply in localization
                                        for (lang in curr_loc) {
                                            for (var ar = 0; ar < arg_list_lang[lang].length; ar++) {

                                                arg = arg_list_lang[lang][ar];
                                                debug_lang[lang] = debug_lang[lang] + "arg: " + arg + "\n";
                                                r_exp = new RegExp(`\\b${arg}\\b`, "i");

                                                for (var qr = 0; qr < curr_transl_quick_replies[lang].length; qr++) {
                                                    quick_reply = curr_transl_quick_replies[lang][qr];

                                                    if (r_exp.test(quick_reply)) {
                                                        // new_test = new_test + count[qr] + ",";
                                                        new_test_lang[lang] = new_test_lang[lang] + selectors[qr] + ",";
                                                        if (!matching_selectors_lang[lang].includes(selectors[qr])) {
                                                            matching_selectors_lang[lang].push(selectors[qr]);
                                                        }
                                                        debug_lang[lang] = debug_lang[lang] + new_test_lang[lang] + "\n";
                                                    }
                                                }
                                            }

                                            if (new_test_lang[lang] == old_test_lang[lang]) {

                                                console.log("no match " + lang + " in flow " + obj.flows[fl].name)
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCH " + "\n";
                                            }


                                            var unique_selectors = matching_selectors.sort().join(',');
                                            var unique_selectors_lang = matching_selectors_lang[lang].sort().join(',');
                                            if (unique_selectors != unique_selectors_lang) {
                                                console.log(" in flow " + obj.flows[fl].name + "no matching selectors original " + matching_selectors + " and " + lang + " " + matching_selectors_lang[lang])
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCHING SELECTORS " + "\n";
                                            }


                                            if (new_test_lang[lang] != old_test_lang[lang] && unique_selectors == unique_selectors_lang) {
                                                obj.flows[fl].localization[lang][case_id].arguments = [new_test_lang[lang]];

                                            }
                                        }


                                    }
                                    else if (curr_case.type == "has_all_words") {

                                        var arg_list = obj.flows[fl].nodes[j].router.cases[c].arguments[0].split(/[\s,]+/).filter(function (i) { return i });;
                                        var new_test = "";


                                        // do the same for the languages in localiz
                                        var arg_list_lang = {};
                                        var new_test_lang = {};
                                        var matching_selectors_lang = {};

                                        for (lang in curr_loc) {
                                            arg_list_lang[lang] = obj.flows[fl].localization[lang][case_id].arguments[0].split(/[\s,]+/).filter(function (i) { return i });
                                            new_test_lang[lang] = "";

                                        }

                                        debug = debug + "arg list: " + arg_list + "\n";
                                        for (lang in curr_loc) {
                                            debug_lang[lang] = debug_lang[lang] + "arg list: " + arg_list_lang[lang] + "\n";
                                        }

                                        // find matching qr
                                        for (var qr = 0; qr < curr_quick_replies.length; qr++) {
                                            var quick_reply = curr_quick_replies[qr];
                                            var match_all = arg_list.every(function (word) {

                                                r_exp = new RegExp(word, "i");
                                                return r_exp.test(quick_reply)

                                            });

                                            if (match_all) {
                                                // new_test = new_test + count[qr] + ",";
                                                new_test = new_test + selectors[qr] + ",";


                                            }



                                        }
                                        if (new_test == "") {
                                            console.log("no match" + obj.flows[fl].name)
                                            debug = debug + "NO MATCH " + "\n";
                                        }
                                        else {
                                            obj.flows[fl].nodes[j].router.cases[c].arguments = [new_test];

                                        }




                                        // find matching quick reply in localization
                                        for (lang in curr_loc) {
                                            for (var qr = 0; qr < curr_transl_quick_replies[lang].length; qr++) {
                                                var quick_reply = curr_transl_quick_replies[lang][qr];
                                                var match_all = arg_list_lang[lang].every(function (word) {

                                                    r_exp = new RegExp(word, "i");
                                                    return r_exp.test(quick_reply)

                                                });

                                                if (match_all) {

                                                    new_test_lang[lang] = new_test_lang[lang] + selectors[qr] + ",";

                                                }



                                            }
                                            if (new_test_lang[lang] == "") {
                                                console.log("no match msa " + obj.flows[fl].name)
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCH " + "\n";
                                            }


                                            if (new_test_lang[lang] != new_test) {
                                                console.log(" in flow " + obj.flows[fl].name + "no matching selectors")
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCHING SELECTORS " + "\n";
                                            }


                                            if (new_test_lang[lang] != "" && new_test_lang[lang] == new_test) {
                                                obj.flows[fl].localization[lang][case_id].arguments = [new_test_lang[lang]];

                                            }


                                        }

                                    }
                                    else if (curr_case.type == "has_phrase") {
                                        var arg = obj.flows[fl].nodes[j].router.cases[c].arguments[0];
                                        var new_test = "";
                                        debug = debug + "arg: " + arg + "\n";

                                        // do the same for the languages in localiz
                                        var arg_lang = {};
                                        var new_test_lang = {};

                                        for (lang in curr_loc) {
                                            arg_lang[lang] = obj.flows[fl].localization[lang][case_id].arguments[0];
                                            new_test_lang[lang] = "";
                                            debug_lang[lang] = debug_lang[lang] + "arg: " + arg_lang[lang] + "\n";

                                        }



                                        // find matching qr
                                        for (var qr = 0; qr < curr_quick_replies.length; qr++) {
                                            var quick_reply = curr_quick_replies[qr];

                                            var r_exp = new RegExp(arg, "i");


                                            if (r_exp.test(quick_reply)) {

                                                //new_test = new_test + count[qr] + ",";
                                                new_test = new_test + selectors[qr] + ",";

                                            }
                                        }

                                        if (new_test == "") {
                                            console.log("no match" + obj.flows[fl].name)
                                            debug = debug + "NO MATCH " + "\n";
                                        }
                                        else {
                                            obj.flows[fl].nodes[j].router.cases[c].arguments = [new_test];
                                        }



                                        // find matching quick reply in localization
                                        for (lang in curr_loc) {
                                            for (var qr = 0; qr < curr_transl_quick_replies[lang].length; qr++) {
                                                var quick_reply = curr_transl_quick_replies[lang][qr];
                                                var r_exp = new RegExp(arg, "i");

                                                if (r_exp.test(quick_reply)) {
                                                    new_test_lang[lang] = new_test_lang[lang] + selectors[qr] + ",";

                                                }
                                            }

                                            if (new_test_lang[lang] == "") {
                                                console.log("no match msa" + obj.flows[fl].name)
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCH " + "\n";
                                            }

                                            if (new_test_lang[lang] != new_test) {
                                                console.log(" in flow " + obj.flows[fl].name + "no matching selectors")
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCHING SELECTORS " + "\n";
                                            }


                                            if (new_test_lang[lang] != "" && new_test_lang[lang] == new_test) {
                                                obj.flows[fl].localization[lang][case_id].arguments = [new_test_lang[lang]];

                                            }


                                        }




                                    }
                                    else if (curr_case.type == "has_only_phrase") {
                                        var arg = obj.flows[fl].nodes[j].router.cases[c].arguments[0];
                                        debug = debug + "arg: " + arg + "\n";
                                        new_test = "";

                                        // do the same for the languages in localiz
                                        var arg_lang = {};
                                        var new_test_lang = {};

                                        for (lang in curr_loc) {
                                            arg_lang[lang] = obj.flows[fl].localization[lang][case_id].arguments[0];
                                            new_test_lang[lang] = "";
                                            debug_lang[lang] = debug_lang[lang] + "arg: " + arg_lang[lang] + "\n";

                                        }




                                        // find matching qr
                                        for (var qr = 0; qr < curr_quick_replies.length; qr++) {
                                            var quick_reply = curr_quick_replies[qr];

                                            if (quick_reply.toLowerCase().trim() == arg.toLowerCase().trim()) {
                                                new_test = new_test + selectors[qr] + ",";
                                                debug = debug + new_test + "\n";

                                            }



                                        }
                                        if (new_test == "") {
                                            debug = debug + "NO MATCH " + "\n";
                                            console.log("no match" + obj.flows[fl].name)


                                        }
                                        else {
                                            obj.flows[fl].nodes[j].router.cases[c].arguments = [new_test];

                                        }

                                        // find matching quick reply in localization
                                        for (lang in curr_loc) {
                                            for (var qr = 0; qr < curr_transl_quick_replies[lang].length; qr++) {
                                                var quick_reply = curr_transl_quick_replies[lang][qr];

                                                if (quick_reply.toLowerCase().trim() == arg_lang[lang].toLowerCase().trim()) {
                                                    new_test_lang[lang] = new_test_lang[lang] + selectors[qr] + ",";
                                                    debug_lang[lang] = debug_lang[lang] + new_test_lang[lang] + "\n";

                                                }
                                            }

                                            if (new_test_lang[lang] == "") {
                                                console.log("no match msa" + obj.flows[fl].name)
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCH " + "\n";
                                            }

                                            if (new_test_lang[lang] != new_test) {
                                                console.log(" in flow " + obj.flows[fl].name + "no matching selectors")
                                                debug_lang[lang] = debug_lang[lang] + "NO MATCHING SELECTORS " + "\n";
                                            }


                                            if (new_test_lang[lang] != "" && new_test_lang[lang] == new_test) {
                                                obj.flows[fl].localization[lang][case_id].arguments = [new_test_lang[lang]];

                                            }


                                        }

                                    }



                                    obj.flows[fl].nodes[j].router.cases[c].type = "has_any_word";

                                }

                            }








                            break;

                        }
                    }
                }


            }
        }

    }

}
new_flows = JSON.stringify(obj, null, 2);
var output_path = path.join(__dirname, "../../flavour/Malaysia/output/plh_malaysia_flavour_msa_no_qr.json");
fs.writeFile(output_path, new_flows, function (err, result) {
    if (err) console.log('error', err);
});



var output_path = path.join(__dirname, "../../flavour/Malaysia/output/debug.txt");
fs.writeFile(output_path, debug, function (err, result) {
    if (err) console.log('error', err);
});

var output_path = path.join(__dirname, "../../flavour/Malaysia/output/debug_msa.txt");
fs.writeFile(output_path, debug_lang.msa, function (err, result) {
    if (err) console.log('error', err);
});