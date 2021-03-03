var fs = require('fs');
var path = require("path");
var input_path_flows = path.join(__dirname, "../products/covid-19-parenting/santiago_test.json");
var input_path_transl = path.join(__dirname, "../chiara-testing/file_for_traslation.json");
var json_string_flows = fs.readFileSync(input_path_flows).toString();
var json_string_transl = fs.readFileSync(input_path_transl).toString();
var obj_fl = JSON.parse(json_string_flows);
var obj_tr = JSON.parse(json_string_transl);




for (var fl = 0; fl < obj_fl.flows.length; fl++) {
    var flow_id = obj_fl.flows[fl].uuid;
    if (obj_tr.hasOwnProperty(flow_id)) {
        obj_fl.flows[fl].localization = obj_tr[flow_id].localization;
    }
}

var flows_with_localiz = JSON.stringify(obj_fl, null, 2);
var output_path = path.join(__dirname, "../chiara-testing/santiago_test_with_localization.json");
fs.writeFile(output_path, flows_with_localiz, function (err, result) {
    if (err) console.log('error', err);
});