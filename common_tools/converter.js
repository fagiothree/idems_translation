const PO = require('pofile');

function json_to_po(jsonFile, { isTemplate }) {
    const json = JSON.parse(jsonFile.toString());
    let po = new PO();
    po.headers['Content-Type'] = 'text/plain; charset=utf-8';
    for (const message of json) {
        let item = new PO.Item();
        item.msgid = message.SourceText;
        item.msgstr.push(isTemplate ? '' : message.text);
        item.msgctxt = message.type;
        item.extractedComments.push(`type=${message.type}`);
        if (message.note) {
            item.extractedComments.push(...message.note.split('\n'));
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
        let note = [];
        for (const comment of item.extractedComments) {
            const splitComment = comment.split('=');
            if (splitComment.length == 2) {
                const [key, value] = splitComment;
                message[key] = value;
            } else {
                note.push(comment);
            }
        }
        message.note = note.join('\n');
        json.push(message);
    }

    return JSON.stringify(json, null, 2);
}

module.exports = {
    json_to_po,
    po_to_json
};
