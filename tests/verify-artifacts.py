"""Read-only source verification; --export regenerates public text excerpts.

Run: py tests/verify-artifacts.py [--export] [--source-dir ORIGINAL_CASE]
No samples or encrypted files are read or executed.
"""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
WARNING = "Selected text excerpts, not full captures. Record indexes are 1-based CSV data records, excluding the header. Hash/header evidence does not prove a cryptographic algorithm."
A_RECORDS = {343, *range(442, 446), *range(447, 451), 461, 464, 475, 478, 479}
DECOYS = ("inventory.csv", "lab_document.rtf", "student_notes.txt")


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest().upper()


def redact(value):
    value = re.sub(r"Environment: .*", "Environment: [REDACTED_ENVIRONMENT]", value, flags=re.S)
    return re.sub(r"(?i)(\\Users\\)[^\\\s\";]+", r"\1[REDACTED_USER]", value)


def encode(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def build(source_dir):
    readme = (ROOT / "README.md").read_text(encoding="utf-8-sig")
    cited = set()
    for match in re.finditer(r"\bR(\d+)(?:[–-]R?(\d+))?", readme):
        first, last = int(match[1]), int(match[2] or match[1])
        assert last >= first
        cited.update(range(first, last + 1))
    assert A_RECORDS <= cited, "README scenario A citations changed; review source mapping."
    selected = {"A_200.csv": A_RECORDS, "B_unreachable.csv": cited - A_RECORDS}
    timeline_text = (ROOT / "src/data/timeline.js").read_text(encoding="utf-8-sig")
    timeline = json.loads(timeline_text.split("export const timeline = ", 1)[1].strip().removesuffix(";"))
    expected_events = []
    for event in timeline:
        match = re.fullmatch(r"(A_200.csv|B_unreachable.csv) · R(\d+)", event["source"])
        assert match, f"Unsupported timeline source: {event['source']}"
        filename, index = match[1], int(match[2])
        selected[filename].add(index)
        expected_events.append((filename, index, event["pid"], event["time"], None))

    processes_text = (ROOT / "src/data/verifiedProcesses.js").read_text(encoding="utf-8-sig")
    process_pattern = (
        r"\{\s*pid:\s*(\d+),\s*parentPid:\s*(\d+),[^\n]*time:\s*'([^']+)',"
        r"\s*source:\s*'B_unreachable\.csv · R(\d+)[^']*'"
    )
    processes = re.findall(process_pattern, processes_text)
    assert len(processes) == len(re.findall(r"\bsource:", processes_text)), "Unparsed process source."
    assert processes, "Process source list is empty."
    for pid, parent, time, index in processes:
        expected_events.append(("B_unreachable.csv", int(index), int(pid), time, int(parent)))
    # All extra R references in the process data belong to its explicitly cited B capture.
    selected["B_unreachable.csv"].update(map(int, re.findall(r"\bR(\d+)", processes_text)))
    sources, manifest = {}, []

    def register(filename, kind, entries, source_count):
        path = source_dir / filename
        sources[filename] = {"kind": kind, "entries": entries}
        manifest.append({
            "source_filename": filename,
            "original_sha256": sha256(path),
            "original_bytes": path.stat().st_size,
            "source_entry_count": source_count,
            "excerpt_entry_count": len(entries),
            "excerpt_bytes": len(encode(sources[filename])),
            "kind": kind,
        })

    for filename in (*selected, "decoys_before.csv", "decoys_A_200.csv",
                     "decoys_after_hashes.csv", "decoys_after_files.csv"):
        entries, total = [], 0
        with (source_dir / filename).open(encoding="utf-8-sig", newline="") as stream:
            for index, row in enumerate(csv.DictReader(stream), 1):
                total = index
                assert None not in row and all(value is not None for value in row.values())
                if filename in selected:
                    keep = index in selected[filename]
                else:
                    name = row.get("Path", row.get("Name", "")).rsplit("\\", 1)[-1]
                    keep = name.removesuffix(".WNCRY") in DECOYS
                if keep:
                    entries.append({"record_index": index,
                                    "fields": {key: redact(value) for key, value in row.items()}})
        if filename in selected:
            assert {entry["record_index"] for entry in entries} == selected[filename]
        else:
            assert len(entries) == 3, f"Expected three decoys: {filename}"
        register(filename, "csv_data_records", entries, total)

    for filename, index, pid, time, parent in expected_events:
        fields = next(item["fields"] for item in sources[filename]["entries"]
                      if item["record_index"] == index)
        assert fields["PID"] == str(pid), f"{filename} R{index}: PID mismatch"
        assert fields["Time of Day"].split()[0] == time, f"{filename} R{index}: time mismatch"
        if parent is not None:
            assert fields["Operation"] == "Process Start", f"R{index}: expected Process Start"
            match = re.search(r"\bParent PID: (\d+)\b", fields["Detail"])
            assert match and int(match[1]) == parent, f"R{index}: PPID mismatch"

    filename = "handles_modules_decoys_verified.md"
    lines = (source_dir / filename).read_text(encoding="utf-8-sig").splitlines()
    start = lines.index("### Encrypted File Header Inspection (`.WNCRY`)") + 1
    stop = lines.index("### Dropped Ransom Artifacts")
    entries = [{"line_number": index, "text": redact(line)}
               for index, line in enumerate(lines, 1) if start <= index <= stop]
    assert sum("`WANACRY!`" in item["text"] and ".WNCRY" in item["text"]
               for item in entries) == 3
    register(filename, "text_lines_from_existing_audit_not_new_binary_inspection", entries, len(lines))

    payload = {
        "schema_version": 1, "warning": WARNING,
        "redactions": [
            "Windows user-profile names replaced by [REDACTED_USER].",
            "Process Start environment blocks replaced by [REDACTED_ENVIRONMENT]; not needed for event attribution, may contain identity/credentials.",
            "All source columns retained; all other field content unchanged.",
        ],
        "selection": "All README R-number citations/ranges; explicitly mapped A records, remaining citations belong to B. Union with every src/data/timeline.js source and every R citation in src/data/verifiedProcesses.js (B capture). Three decoys only from four CSVs; header section from existing text audit.",
        "ui_crosschecks": {"timeline_events": len(timeline), "process_start_events": len(processes),
                           "checks": "All timeline PID/time and process-start PID/time/operation/parent match selected original rows."},
        "sources": sources,
    }
    raw = encode(payload)
    assert len(raw) < 300_000, "Excerpt exceeds publication budget."
    assert not re.search(rb"C:\\\\Users\\\\(?!\[REDACTED_USER\])", raw, re.I)
    assert not re.search(rb"(?i)(?:password|api[_ -]?key|access[_ -]?token)\s*[=:]\s*\S+", raw)
    metadata = encode({
        "schema_version": 1, "warning": WARNING,
        "artifact": "source-records.json", "artifact_bytes": len(raw),
        "artifact_sha256": hashlib.sha256(raw).hexdigest().upper(),
        "sources": manifest,
        "verification": "Run py tests/verify-artifacts.py on the original case host; optional --source-dir points to original text evidence. Public excerpts alone cannot independently re-hash absent full captures.",
    })
    return {"source-records.json": raw, "manifest.json": metadata}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--export", action="store_true")
    parser.add_argument("--source-dir", type=Path, default=ROOT.parent)
    args = parser.parse_args()
    expected = build(args.source_dir)
    directory = ROOT / "public" / "artifacts"
    if args.export:
        directory.mkdir(parents=True, exist_ok=True)
        for name, contents in expected.items():
            (directory / name).write_bytes(contents)
    for name, contents in expected.items():
        assert (directory / name).read_bytes() == contents, f"Source mismatch: {name}"
    assert sum(path.stat().st_size for path in directory.iterdir() if path.is_file()) < 300_000
    data = json.loads(expected["source-records.json"])
    for filename, source in data["sources"].items():
        print(f"{filename}: {len(source['entries'])} matching {source['kind']}")
    print(f"PASS: every selected field/line and original SHA-256 verified; {sum(map(len, expected.values()))} public bytes")


if __name__ == "__main__":
    main()
