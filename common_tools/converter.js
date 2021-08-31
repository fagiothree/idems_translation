const PO = require('pofile');

function json_to_po(jsonFile, { isTemplate }) {
    const json = JSON.parse(jsonFile.toString());
    let po = new PO();
    po.headers['Content-Type'] = 'text/plain; charset=utf-8';
    for (const message of json) {
        let item = new PO.Item();
        item.msgid = message.SourceText;
        item.msgstr = isTemplate ? '' : message.text;
        item.extractedComments = [`type=${message.type}`];
        if (message.note) {
            item.extractedComments.push(message.note);
        }
        po.items.push(item);
    }
    return po.toString();
}

function po_to_json(poFile, _) {
    let po = PO.parse(poFile.toString());
    let json = [];
    for (const item of po.items) {
        let message = {
            SourceText: item.msgid,
            text: item.msgstr[0],
        };
        for (const comment of item.extractedComments) {
            const splitComment = comment.split('=');
            if (splitComment.length == 2) {
                const [key, value] = splitComment;
                message[key] = value;
            } else {
                message.note = comment;
            }
        }
        json.push(message);
    }

    return JSON.stringify(json, null, 2);
}

module.exports = {
    json_to_po,
    po_to_json
};
