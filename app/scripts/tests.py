from unittest import TestCase
import os
from .extract_texts_script import is_valid_value_string, process_file
import json
from pathlib import Path

class TestValidValueString(TestCase):

    def not_ok(self, value):
        self.assertFalse(
            is_valid_value_string(value),
            f"Value string '{value}' should not be valid"
        )

    def ok(self, value):
        self.assertTrue(
            is_valid_value_string(value),
            f"Value string '{value}' should be valid"
        )

    def test_not_ends_with_certain_file_extensions(self):
        self.not_ok('file.json')
        self.not_ok('pic.png')
        self.not_ok('drawing.svg')
        self.not_ok('music.mp3')
        self.not_ok('video.mp4')

    def test_not_boolean(self):
        self.not_ok('true')
        self.not_ok('false')

    def test_not_contains_a_number(self):
        self.not_ok('123')
        self.not_ok('456seven')
        self.not_ok('one23')

    def test_not_nothing(self):
        self.not_ok('None')
        self.not_ok('')

    def test_not_starts_with_certain_characters(self):
        self.not_ok('https://example.com')
        self.not_ok('@placeholder')
        self.not_ok('plh_onefish')
        self.not_ok('+@twofish')
        self.not_ok('!@redfish')
        self.not_ok('!!@bluefish')

    def test_is_real_word(self):
        self.not_ok('example_words')
        # self.not_ok('comple><ity')
        self.ok('example')
        self.ok('self-starter')

class TestJSONFiles(TestCase):

    def files_are_equal(self, file, ref_json):
        with open(file, 'r', encoding='utf-8') as f1:
            data1 = json.load(f1)
            data2 = ref_json
        self.assertEqual(data1, data2)

    def test_data_list_output(self):
        ref_json = process_file(Path("input_data_list.json"), Path("./input"))
        self.files_are_equal('./expected_output/output_data_list.json', ref_json)
        
    def test_global_output(self):    
        ref_json = process_file(Path("input_global.json"), Path("./input"))
        self.files_are_equal('./expected_output/output_global.json', ref_json)
        
    def test_template_output(self):
        ref_json = process_file(Path("input_template.json"), Path("./input"))
        self.files_are_equal('./expected_output/output_template.json', ref_json)
        
    def test_tour_output(self):
        ref_json = process_file(Path("input_tour.json"), Path("./input"))
        self.files_are_equal('./expected_output/output_tour.json', ref_json)
