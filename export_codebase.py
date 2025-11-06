import os

# You can customize these file types
INCLUDE_EXTENSIONS = (".ts", ".tsx", ".js", ".json", ".html", ".css", ".md", ".toml")
EXCLUDE_DIRS = {".git", "node_modules", "dist", "build", ".next", "__pycache__"}

with open("codebase.txt", "w", encoding="utf-8") as out:
    for root, dirs, files in os.walk("."):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith(INCLUDE_EXTENSIONS):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    out.write(f"\n\n===== {path} =====\n\n")
                    out.write(content)
                except Exception as e:
                    print(f"Skipping {path}: {e}")

print("✅ Codebase exported successfully to codebase.txt")
