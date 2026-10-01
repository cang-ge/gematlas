import re
path = 'scripts/download-gem-images.py'
content = open(path).read()

start_match = re.search(r'^def main\(\):', content, re.MULTILINE)
end_match = re.search(r"if __name__ == '__main__':", content, re.MULTILINE)
if not start_match or not end_match:
    print("FAIL: couldn't find main() boundaries")
    raise SystemExit(1)

start = start_match.start()
end = end_match.start()

new_main = '''def main():
    """Process gems in batches. Re-runnable: skips completed gems."""
    BATCH_SIZE = 5
    BATCH_PAUSE = 30
    SKIP_IF_FILES = 4

    total = len(GEMS)
    gem_list = list(GEMS.items())

    # Find first incomplete gem (resume-friendly)
    start_idx = 0
    for i, (gem_id, _) in enumerate(gem_list):
        gem_dir = OUT_DIR / gem_id
        if gem_dir.exists() and len(list(gem_dir.glob("*.png"))) >= SKIP_IF_FILES:
            yaml_path = YAML_DIR / f"{gem_id}.yaml"
            if yaml_path.exists() and "images:" in yaml_path.read_text("utf-8"):
                start_idx = i + 1
                continue
        break
    print(f"Resuming from gem #{start_idx + 1}/{total}")

    for batch_start in range(start_idx, total, BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, total)
        batch = gem_list[batch_start:batch_end]
        is_last = batch_end >= total

        for i, (gem_id, query) in enumerate(batch, batch_start + 1):
            print(f"\\n[{i}/{total}] {gem_id} ({query})")
            gem_dir = OUT_DIR / gem_id
            gem_dir.mkdir(parents=True, exist_ok=True)

            yaml_path = YAML_DIR / f"{gem_id}.yaml"
            existing_files = list(gem_dir.glob("*.png"))
            if len(existing_files) >= SKIP_IF_FILES:
                print(f"  skip: already has {len(existing_files)} files")
                continue

            time.sleep(2)
            try:
                results = wikimedia_search(query, limit=8)
            except Exception as e:
                print(f"  search failed: {e}")
                placeholder_files = [f"{gem_id}.png"]
                for idx in range(1, 4):
                    placeholder_files.append(f"{gem_id}-gallery-{idx}.png")
                for fname in placeholder_files:
                    placeholder_png(gem_dir / fname)
                update_yaml(gem_id, placeholder_files)
                continue

            if not results:
                print("  no results, creating placeholders")
                placeholder_files = [f"{gem_id}.png"]
                for idx in range(1, 4):
                    placeholder_files.append(f"{gem_id}-gallery-{idx}.png")
                for fname in placeholder_files:
                    placeholder_png(gem_dir / fname)
                update_yaml(gem_id, placeholder_files)
                continue

            filenames = []
            for idx, result in enumerate(results[:5]):
                title = result.get("title", "").replace("File:", "")
                try:
                    img_url = get_image_url(title)
                    if not img_url:
                        continue
                    ext = ".webp" if idx == 0 else f"-gallery-{idx}.webp"
                    dest = gem_dir / f"{gem_id}{ext}"
                    download_image(img_url, dest)
                    filenames.append(dest.name)
                except Exception as e:
                    print(f"  {title}: {e}")
                time.sleep(1)

            if filenames:
                update_yaml(gem_id, filenames)

        if not is_last:
            print(f"\\n--- Batch {batch_end}/{total} done. Pausing {BATCH_PAUSE}s ---")
            time.sleep(BATCH_PAUSE)

    print("\\nDone. Run `pnpm generate:pages; pnpm build` to integrate images.")

'''

content = content[:start] + new_main + content[end:]
open(path, 'w').write(content)
print('OK')