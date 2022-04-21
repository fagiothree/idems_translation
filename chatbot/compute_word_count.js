const ex = require('./extract/extract.js');
const fs = require('fs');
const path = require('path');


var input = path.join(__dirname,  "../../parenttext-deployment/parenttext-international-repo/flows/plh-international-flavour.json");
var input_abtesting = path.join(__dirname,  "../../parenttext-deployment/parenttext-international-repo/temp/plh-international-flavour_expire_ABtesting.json");

const obj = readInputFile(input);
const obj_ab = readInputFile(input_abtesting);


var word_counts = {};
var word_counts_ab = {};
var group_names = [];

var groups_of_flows = [];
var groups_of_flows_ab = [];

group_names.push("All flows")
function filter_no(fl){
    return (true)
}
filter_flows(filter_no)

group_names.push("Content flows")
function filter_content(fl){
    return (fl.name.startsWith("PLH - Content") && !fl.name.includes("CheckIn"))
}
filter_flows(filter_content)


group_names.push("Check-in flows")
function filter_checkin(fl){
    return (fl.name.includes("CheckIn"))
}
filter_flows(filter_checkin)


group_names.push("Content flows - most relevant")
function filter_flows_rel(fl){
    let flow_list = [
        "PLH - Content - Time - One on one time baby",
        "PLH - Content - Time - One on one time child",
        "PLH - Content - Time - One on one time teen",
       "PLH - Content - Relax - Take a pause",
       "PLH - Content - Relax - Anger management", 
       "PLH - Content - Positive - Positive instructions",
       "PLH - Content - Positive - Behave - Praise",
       "PLH - Content - Positive - Behave - Routines",
       "PLH - Content - Positive - Rules",
       "PLH - Content - Positive - Behave - Redirect",
       "PLH - Content - Positive - Behave - Consequences",
       "PLH - Content - Positive - Behave - Ignore",
"PLH - Content - Positive - Behave - ProblemSolving",
"PLH - Content - Positive - Behave - Crying",
"PLH - Content - Positive - Behave - Emotion",
"PLH - Content - Positive - Behave - Crisis",
"PLH - Content - Positive - Safe or unsafe touch",
"PLH - Content - Positive - Introduction"
    ];
    return (flow_list.includes(fl.name))
}
filter_flows(filter_flows_rel)

group_names.push("Check-in flow - most relevant")
function filter_check_rel(fl){
    let checkin_list = [
        "PLH - Content - Time - CheckIn - One on one time",
       "PLH - Content - Relax - CheckIn - Anger management", 
       "PLH - Content - Positive - CheckIn - Instructions",
       "PLH - Content - Positive - CheckIn - Praise",
       "PLH - Content - Positive - CheckIn - Routines",
       "PLH - Content - Positive - CheckIn - Rules",
       "PLH - Content - Positive - CheckIn - Redirect",
       "PLH - Content - Positive - CheckIn - Consequences",
       "PLH - Content - Positive - CheckIn - Ignore",
"PLH - Content - Positive - CheckIn - ProblemSolving",
"PLH - Content - Positive - CheckIn - Crying",
"PLH - Content - Positive - CheckIn - Emotion",
"PLH - Content - Positive - CheckIn - Crisis",
"PLH - Content - Positive - CheckIn - Safe or unsafe touch"
    ];
    return (checkin_list.includes(fl.name))
}
filter_flows(filter_check_rel)

group_names.push("IPV content flows")
function filter_ipv_content(fl){
    return (fl.name.includes("IPV") && !fl.name.includes("CheckIn"))
}
filter_flows(filter_ipv_content)

group_names.push("IPV checkin flows")
function filter_ipv_checkin(fl){
    return (fl.name.includes("IPV") && fl.name.includes("CheckIn"))
}
filter_flows(filter_ipv_checkin)


group_names.push("Activities - Adult")
function filter_activity_adult(fl){
    return (fl.name.startsWith("PLH - Activity - Adult"))
}
filter_flows(filter_activity_adult)

group_names.push("Adult - 5 activities")
function filter_act_ad_rel(fl){
    let adult_activities_list = [
        "PLH - Activity - Adult - Active - 2 truths 1 lie",
        "PLH - Activity - Adult - Active - Crazy chicken",
        "PLH - Activity - Adult - Active - Family work out",
        "PLH - Activity - Adult - Active - Relax",
        "PLH - Activity - Adult - Active - Stop and listen"
    ];
    return (adult_activities_list.includes(fl.name))
}
filter_flows(filter_act_ad_rel)


group_names.push("Activities - Baby")
function filter_activity_baby(fl){
    return (fl.name.startsWith("PLH - Activity - Baby"))
}
filter_flows(filter_activity_baby)

group_names.push("Baby - 3 activities")
function filter_act_baby_rel(fl){
    let baby_activities_list = [
        "PLH - Activity - Baby - Active - Cooking together",
        "PLH - Activity - Baby - Active - Dance party",
        "PLH - Activity - Baby - Active - Down in a ditch"
    ];
    return (baby_activities_list.includes(fl.name))
}
filter_flows(filter_act_baby_rel)


group_names.push("Activities - Child")
function filter_activity_child(fl){
    return (fl.name.startsWith("PLH - Activity - Child"))
}
filter_flows(filter_activity_child)

group_names.push("Child - 3 activities")
function filter_act_ch_rel(fl){
    let child_activities_list = [
        "PLH - Activity - Child - Active - Freeze dance",
        "PLH - Activity - Child - Active - Make housework fun",
        "PLH - Activity - Child - Active - Mirror"
       
    ];
    return (child_activities_list.includes(fl.name))
}
filter_flows(filter_act_ch_rel)

group_names.push("Activities - Teen")
function filter_activity_teen(fl){
    return (fl.name.startsWith("PLH - Activity - Teen"))
}
filter_flows(filter_activity_teen)

group_names.push("Teen - 3 activities")
function filter_act_teen_rel(fl){
    let teen_activities_list = [
        "PLH - Activity - Teen - Calm - At the end of the day",
        "PLH - Activity - Teen - Calm - Dream travel",
        "PLH - Activity - Teen - Calm - How was your day"
    ];
    return (teen_activities_list.includes(fl.name))
}
filter_flows(filter_act_teen_rel)


group_names.push("Supportive - Calm")
function filter_calm(fl){
    return (fl.name == "PLH - Supportive - Calm")
}
filter_flows(filter_calm)

group_names.push("Supportive - Praise ")
function filter_praise(fl){
    return (fl.name == "PLH - Supportive - Praise")
}
filter_flows(filter_praise)

group_names.push("Other Supportive")
function filter_supportive(fl){
    return (fl.name.includes("Supportive") && fl.name != "PLH - Supportive - Praise" && fl.name != "PLH - Supportive - Calm")
}
filter_flows(filter_supportive)

group_names.push("Surveys")
function filter_survey(fl){
    return (fl.name.includes("Survey"))
}
filter_flows(filter_survey)

group_names.push("Survey - Parenting")
function filter_survey_parenting(fl){
    return (fl.name.startsWith("PLH - Survey - Parenting"))
}
filter_flows(filter_survey_parenting)



for (let g=0; g< group_names.length; g++){
    word_counts[group_names[g]] = compute_word_count(groups_of_flows[g]);
    word_counts_ab[group_names[g]] = compute_word_count(groups_of_flows_ab[g]);
}



let outputDir = "."
writeOutputFile(outputDir, "word_count_parenttext.txt", JSON.stringify(word_counts, null, 2));
writeOutputFile(outputDir, "word_count_parenttext_abtesting.txt", JSON.stringify(word_counts_ab, null, 2));


////////////////////////////
//videos
var input_videos  = path.join(__dirname, "../../../misc-translate-scripts/video_scripts/output/video/video_englishtemplate_man_narration_list.json")
const obj_video = readInputFile(input_videos);

let word_count_video = 0;
let word_count_video_tot = 0;
let video_list = [
    "01. One-on-One Time – Babies",
"02. One-on-One Time - Children",
"03. One-on-One Time - Teens",
"21. Looking after yourself",
"25. Anger management advice",
"05. Giving positive instructions",
"06. Positive praise for good behaviour",
"07. Create a routine",
"08. Household Rules",
"09. Encouraging good behaviour: changing your approach",
"10. Encouraging good behaviour: teaching consequences",
"12. Encouraging good behaviour: not reacting to tantrums",
"13. Encouraging good behaviour: solving problems",
"15. Soothing a crying baby",
"16. Helping children manage their emotions",
"17. Helping your child through a difficult situation",
"18. Protecting your child against abuse",
"04. Staying Positive"]

obj_video.forEach(video => {
    if (video_list.includes(video.title)){
        console.log(video.title)
        word_count_video += (video.text.split(/\s+/).length + video.title.split(/\s+/).length - 1)
    }
    
    word_count_video_tot += (video.text.split(/\s+/).length + video.title.split(/\s+/).length - 1)
    if (video.title.includes("IPV")){
        word_count_video_tot += (video.text.split(/\s+/).length + video.title.split(/\s+/).length - 1)
    }
    
});
    

console.log("video word count: " + word_count_video)
console.log("tot video word count: " +  word_count_video_tot)


//////////////////////////////////////////////
function compute_word_count(flows_obj){
    var bits = ex.extractTextForTranslation(flows_obj);
    var fileForTransl = ex.createFileForTranslators(bits);
    return ex.removeRepetitions(fileForTransl)[1];
}



function readInputFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
}

function filter_flows(filter_function){
    let g_obj = JSON.parse(JSON.stringify(obj, null, 2));
    let g_obj_ab = JSON.parse(JSON.stringify(obj_ab, null, 2));
    g_obj.flows = g_obj.flows.filter(filter_function);
    g_obj_ab.flows = g_obj_ab.flows.filter(filter_function);
    groups_of_flows.push(g_obj)
    groups_of_flows_ab.push(g_obj_ab)
}

function writeOutputFile(outputDir, filename, data) {
    const outputFile = path.join(outputDir, filename);
    let content = '';
    if (path.extname(outputFile) === '.json') {
        content = JSON.stringify(data, null, 2);
    } else {
        content = data;
    }
    fs.writeFile(
        outputFile,
        content,
        outputFileErrorHandler
    );
}

function outputFileErrorHandler(err) {
    if (err)  {
        console.log('error', err);
    }
}
