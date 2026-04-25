import re


def normalize_ru_phone(s: str) -> str | None:
    """Парсит ввод (8..., +7..., 7..., 9...) в вид +7XXXXXXXXXX или None."""
    if not s or not str(s).strip():
        return None
    d = re.sub(r"\D", "", s.strip())
    if len(d) == 11 and d[0] == "8":
        d = "7" + d[1:]
    if len(d) == 10:
        d = "7" + d
    if len(d) == 11 and d[0] == "7":
        return f"+{d}"
    return None
