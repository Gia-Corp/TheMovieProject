from pytest import raises

from src.settings import _int_env


class TestIntEnv:
    def test_returns_default_when_variable_is_missing(self, monkeypatch):
        monkeypatch.delenv("SOME_INT", raising=False)
        assert _int_env("SOME_INT", 42) == 42

    def test_returns_default_when_variable_is_empty(self, monkeypatch):
        monkeypatch.setenv("SOME_INT", "")
        assert _int_env("SOME_INT", 42) == 42

    def test_returns_parsed_value(self, monkeypatch):
        monkeypatch.setenv("SOME_INT", "7")
        assert _int_env("SOME_INT", 42) == 7

    def test_raises_clear_error_when_value_is_invalid(self, monkeypatch):
        monkeypatch.setenv("SOME_INT", "abc")
        with raises(RuntimeError, match="SOME_INT must be an integer"):
            _int_env("SOME_INT", 42)
