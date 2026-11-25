from pathlib import Path
import re

root = Path(".")
files = [
    root / "index.html",
    root / "css/style.css",
    root / "js/main.js",
    root / "js/content-loader.js",
    root / "content/site.json",
]

patterns = [
    r'''(?:src|poster|href)=[^"'#?]+["']''',
    r'''(?:assets|images|videos/[^"']+)["']''',
]

references = set()

for file in files:
    if not file.exists():
        continue

    content = file.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    for pattern in patterns:
        for value in re.findall(pattern, content):
            if (
                value.startswith(("http://", "https://", "mailto:", "tel:"))
                or value.endswith((".css", ".js", ".html"))
            ):
                continue

            references.add(value)

missing = []

for value in sorted(references):
    clean = value.split("?")[0]

    if not (root / clean).exists():
        missing.append(clean)

if missing:
    print("FICHEIROS EM FALTA:")
    for item in missing:
        print(f"  - {item}")
else:
    print("Todos os recursos referenciados foram encontrados.")
