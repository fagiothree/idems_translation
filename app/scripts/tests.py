from unittest import TestCase
from .extract_texts_script import is_valid_value_string

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
