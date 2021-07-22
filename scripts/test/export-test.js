const assert = require('assert');
const extract = require('../extract/extract_text_for_translation.js');


describe(
    'Extract translation strings from flows',
    function() {
        it('Creates translation strings for every send_msg action', function() {
            const rpExport = {
                flows: [
                    {
                        uuid: "09c4ffdb-f4e4-4246-8cdb-a2fc5c481f29",
                        name: "flow_name",
                        nodes: [
                            {
                                actions: [
                                    {
                                        quick_replies: [],
                                        text: "text_eng",
                                        type: "send_msg",
                                        uuid: "0fb84798-f484-4599-8b2e-348aae9470dd"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const extraction = extract.extractTextForTranslation(rpExport);
            const expected = {
                flowid: "09c4ffdb-f4e4-4246-8cdb-a2fc5c481f29",
                name: "flow_name",
                localization: {
                    eng: {
                        "0fb84798-f484-4599-8b2e-348aae9470dd" : {
                            text: ["text_eng"],
                            quick_replies: [],
                        }
                    }
                }
            };
            assert.deepEqual(
                extraction['09c4ffdb-f4e4-4246-8cdb-a2fc5c481f29'],
                expected
            );
        });

        it('Creates translation strings for router nodes', function() {
            const rpExport = {
                flows: [
                    {
                        uuid: "aa1c645b-c302-4d00-9843-5cdea94aa870",
                        name: "flow with router",
                        nodes: [
                            {
                                router: {
                                    operand: "@input.text",
                                    cases: [
                                        {
                                            arguments: ["any", "word"],
                                            type: "has_any_word",
                                            uuid: "848ac3ac-6990-400f-920c-be187f39bc70"
                                        },
                                        {
                                            arguments: ["all", "words"],
                                            type: "has_all_words",
                                            uuid: "84efb73a-4692-4c8c-9e90-863e3c2d8008"
                                        },
                                        {
                                            arguments: ["phrase"],
                                            type: "has_phrase",
                                            uuid: "e4e6059d-cf81-4658-a7de-6b62f1346bd1"
                                        },
                                        {
                                            arguments: ["only phrase"],
                                            type: "has_only_phrase",
                                            uuid: "e4562cf8-2490-4e18-a2d8-27eb66be141b"
                                        },
                                        {
                                            arguments: ["begin"],
                                            type: "has_beginning",
                                            uuid: "b8e86d0c-50fd-4056-b3b0-147e5a009aa6"
                                        }
                                    ]
                                },
                                actions: []
                            }
                        ]
                    }
                ]
            };
            const extraction = extract.extractTextForTranslation(rpExport);
            const expected = {
                flowid: "aa1c645b-c302-4d00-9843-5cdea94aa870",
                name: "flow with router",
                localization: {
                    eng: {
                        "848ac3ac-6990-400f-920c-be187f39bc70" : {
                            arguments: ["any", "word"]
                        },
                        "84efb73a-4692-4c8c-9e90-863e3c2d8008": {
                            arguments: ["all", "words"]
                        },
                        "e4e6059d-cf81-4658-a7de-6b62f1346bd1": {
                            arguments: ["phrase"]
                        },
                        "e4562cf8-2490-4e18-a2d8-27eb66be141b": {
                            arguments: ["only phrase"]
                        },
                        "b8e86d0c-50fd-4056-b3b0-147e5a009aa6": {
                            arguments: ["begin"]
                        }
                    }
                }
            };
            assert.deepEqual(
                extraction['aa1c645b-c302-4d00-9843-5cdea94aa870'],
                expected
            );
        });
    });

describe(
    'Transforms translatable messages to format required by translators',
    function() {
        it('Converts arguments text to lower-case', function() {
            const message = {
                bit_type: "arguments",
                text: "TEXT",
                source_text: "TEXT",
                note: "note"
            };
            const expected = {
                SourceText: 'text',
                text: 'text',
                type: 'arguments',
                note: 'note'
            };
            assert.deepEqual(
                extract.transformToTranslationFormat(message),
                expected
            );
        });

        it('Maintains case for text which is not arguments', function() {
            const message = {
                bit_type: "text",
                text: "Text",
                source_text: "Text",
                note: "note"
            };
            const expected = {
                SourceText: 'Text',
                text: 'Text',
                type: 'text',
                note: 'note'
            };
            assert.deepEqual(
                extract.transformToTranslationFormat(message),
                expected
            );
        });
    }
);
