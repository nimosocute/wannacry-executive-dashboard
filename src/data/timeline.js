// 1-based data record indexes, excluding CSV header; exact local times (UTC+7).
// Check: node --input-type=module -e "import {timeline as t} from './src/data/timeline.js'; import a from 'node:assert/strict'; a.equal(t.length,38); a.equal(new Set(t.map(r=>r.id)).size,38); for(const s of ['A','B']) { const r=t.filter(x=>x.scenario===s); a.equal(r.length,s==='A'?6:32); a.deepEqual(r.map(x=>x.time),r.map(x=>x.time).sort()); } console.log('38 records, unique IDs, A/B counts and chronology OK');"
export const timeline = [
  {
    "id": "A-R343",
    "scenario": "A",
    "time": "11:44:16.9469731",
    "event": "Process Start: mẫu được khởi chạy; PPID 2848.",
    "pid": 6520,
    "source": "A_200.csv · R343",
    "findingId": "network",
    "evidenceIds": [
      "E02"
    ]
  },
  {
    "id": "A-R461",
    "scenario": "A",
    "time": "11:44:17.7597933",
    "event": "TCP Connect: 127.0.0.1:49754 -> 127.0.0.1:80.",
    "pid": 6520,
    "source": "A_200.csv · R461",
    "findingId": "network",
    "evidenceIds": [
      "E01"
    ]
  },
  {
    "id": "A-R464",
    "scenario": "A",
    "time": "11:44:17.7607834",
    "event": "TCP Send: 127.0.0.1:49754 -> 127.0.0.1:80. Length: 100 byte.",
    "pid": 6520,
    "source": "A_200.csv · R464",
    "findingId": "network",
    "evidenceIds": [
      "E01"
    ]
  },
  {
    "id": "A-R475",
    "scenario": "A",
    "time": "11:44:17.8177930",
    "event": "TCP Receive: 127.0.0.1:49754 -> 127.0.0.1:80. Length: 155 byte (không phải HTTP Content-Length).",
    "pid": 6520,
    "source": "A_200.csv · R475",
    "findingId": "network",
    "evidenceIds": [
      "E01"
    ]
  },
  {
    "id": "A-R478",
    "scenario": "A",
    "time": "11:44:17.8262714",
    "event": "TCP Disconnect: 127.0.0.1:49754 -> 127.0.0.1:80.",
    "pid": 6520,
    "source": "A_200.csv · R478",
    "findingId": "network",
    "evidenceIds": [
      "E01"
    ]
  },
  {
    "id": "A-R479",
    "scenario": "A",
    "time": "11:44:17.8391858",
    "event": "Process Exit: Exit Status 0.",
    "pid": 6520,
    "source": "A_200.csv · R479",
    "findingId": "network",
    "evidenceIds": [
      "E02"
    ]
  },
  {
    "id": "B-R326",
    "scenario": "B",
    "time": "11:57:33.5614500",
    "event": "Process Start: mẫu được harness khởi chạy; PPID 4872.",
    "pid": 5152,
    "source": "B_unreachable.csv · R326",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R413",
    "scenario": "B",
    "time": "11:57:34.5747453",
    "event": "TCP Reconnect: 127.0.0.1:49757 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5152,
    "source": "B_unreachable.csv · R413",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R498",
    "scenario": "B",
    "time": "11:57:35.0749014",
    "event": "TCP Reconnect: 127.0.0.1:49757 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5152,
    "source": "B_unreachable.csv · R498",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R679",
    "scenario": "B",
    "time": "11:57:35.5749552",
    "event": "TCP Reconnect: 127.0.0.1:49757 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5152,
    "source": "B_unreachable.csv · R679",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R769",
    "scenario": "B",
    "time": "11:57:36.0903993",
    "event": "TCP Reconnect: 127.0.0.1:49757 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5152,
    "source": "B_unreachable.csv · R769",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R770",
    "scenario": "B",
    "time": "11:57:36.0904549",
    "event": "TCP Disconnect: 127.0.0.1:49757 -> 127.0.0.1:80.",
    "pid": 5152,
    "source": "B_unreachable.csv · R770",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R772",
    "scenario": "B",
    "time": "11:57:36.0995946",
    "event": "RegSetValue: SCM ghi Start=2 cho mssecsvc2.0.",
    "pid": 644,
    "source": "B_unreachable.csv · R772",
    "findingId": "services",
    "evidenceIds": [
      "E03"
    ]
  },
  {
    "id": "B-R780",
    "scenario": "B",
    "time": "11:57:36.1196578",
    "event": "Process Start: service instance với token -m security; PPID 644.",
    "pid": 5272,
    "source": "B_unreachable.csv · R780",
    "findingId": "services",
    "evidenceIds": [
      "E03"
    ]
  },
  {
    "id": "B-R828",
    "scenario": "B",
    "time": "11:57:36.8874067",
    "event": "TCP Reconnect: 127.0.0.1:49758 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5272,
    "source": "B_unreachable.csv · R828",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R1001",
    "scenario": "B",
    "time": "11:57:37.3871963",
    "event": "TCP Reconnect: 127.0.0.1:49758 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5272,
    "source": "B_unreachable.csv · R1001",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R1083",
    "scenario": "B",
    "time": "11:57:37.9928423",
    "event": "TCP Reconnect: 127.0.0.1:49758 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5272,
    "source": "B_unreachable.csv · R1083",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R1129",
    "scenario": "B",
    "time": "11:57:38.5846608",
    "event": "TCP Reconnect: 127.0.0.1:49758 -> 127.0.0.1:80. SUCCESS không chứng minh kết nối ứng dụng thành công.",
    "pid": 5272,
    "source": "B_unreachable.csv · R1129",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R1130",
    "scenario": "B",
    "time": "11:57:38.5847171",
    "event": "TCP Disconnect: 127.0.0.1:49758 -> 127.0.0.1:80.",
    "pid": 5272,
    "source": "B_unreachable.csv · R1130",
    "findingId": "network",
    "evidenceIds": []
  },
  {
    "id": "B-R1136",
    "scenario": "B",
    "time": "11:57:38.5925187",
    "event": "CreateFile: C:\\Windows\\tasksche.exe; OpenResult: Created.",
    "pid": 5152,
    "source": "B_unreachable.csv · R1136",
    "findingId": "payload",
    "evidenceIds": [
      "E04"
    ]
  },
  {
    "id": "B-R1137",
    "scenario": "B",
    "time": "11:57:38.5932685",
    "event": "WriteFile: C:\\Windows\\tasksche.exe; Offset: 0; Length: 3,514,368.",
    "pid": 5152,
    "source": "B_unreachable.csv · R1137",
    "findingId": "payload",
    "evidenceIds": [
      "E04"
    ]
  },
  {
    "id": "B-R1142",
    "scenario": "B",
    "time": "11:57:38.6064230",
    "event": "Process Create: PID con 6724; C:\\WINDOWS\\tasksche.exe /i.",
    "pid": 5152,
    "source": "B_unreachable.csv · R1142",
    "findingId": "payload",
    "evidenceIds": [
      "E04"
    ]
  },
  {
    "id": "B-R1143",
    "scenario": "B",
    "time": "11:57:38.6064300",
    "event": "Process Start: C:\\WINDOWS\\tasksche.exe /i; PPID 5152.",
    "pid": 6724,
    "source": "B_unreachable.csv · R1143",
    "findingId": "payload",
    "evidenceIds": [
      "E04"
    ]
  },
  {
    "id": "B-R1179",
    "scenario": "B",
    "time": "11:57:38.6785954",
    "event": "RegSetValue: SCM ghi Start=2 cho evmdthrukdvwcqn063.",
    "pid": 644,
    "source": "B_unreachable.csv · R1179",
    "findingId": "services",
    "evidenceIds": [
      "E03"
    ]
  },
  {
    "id": "B-R1197",
    "scenario": "B",
    "time": "11:57:38.6866410",
    "event": "Process Start: cmd.exe /c \"C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe\"; PPID 644.",
    "pid": 1152,
    "source": "B_unreachable.csv · R1197",
    "findingId": "services",
    "evidenceIds": [
      "E03"
    ]
  },
  {
    "id": "B-R1209",
    "scenario": "B",
    "time": "11:57:38.7258752",
    "event": "Process Start: C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe; PPID 1152.",
    "pid": 3760,
    "source": "B_unreachable.csv · R1209",
    "findingId": "payload",
    "evidenceIds": [
      "E04"
    ]
  },
  {
    "id": "B-R1213",
    "scenario": "B",
    "time": "11:57:38.7612232",
    "event": "RegSetValue: HKLM\\SOFTWARE\\WOW6432Node\\WanaCrypt0r\\wd = C:\\ProgramData\\evmdthrukdvwcqn063.",
    "pid": 3760,
    "source": "B_unreachable.csv · R1213",
    "findingId": "payload",
    "evidenceIds": [
      "E04"
    ]
  },
  {
    "id": "B-R1721",
    "scenario": "B",
    "time": "11:57:38.8749271",
    "event": "Process Start: attrib +h .; PPID 3760.",
    "pid": 5808,
    "source": "B_unreachable.csv · R1721",
    "findingId": "permissions",
    "evidenceIds": [
      "E05"
    ]
  },
  {
    "id": "B-R1724",
    "scenario": "B",
    "time": "11:57:38.8796359",
    "event": "Process Start: icacls . /grant Everyone:F /T /C /Q; PPID 3760.",
    "pid": 2064,
    "source": "B_unreachable.csv · R1724",
    "findingId": "permissions",
    "evidenceIds": [
      "E05"
    ]
  },
  {
    "id": "B-R1844",
    "scenario": "B",
    "time": "11:57:39.2573132",
    "event": "SetSecurityFile: C:\\ProgramData\\evmdthrukdvwcqn063\\b.wnry; Information: DACL; SUCCESS.",
    "pid": 2064,
    "source": "B_unreachable.csv · R1844",
    "findingId": "permissions",
    "evidenceIds": [
      "E05"
    ]
  },
  {
    "id": "B-R2279",
    "scenario": "B",
    "time": "11:57:39.9847610",
    "event": "Process Start: cmd.exe /c 116221791435459.bat; PPID 3760.",
    "pid": 3888,
    "source": "B_unreachable.csv · R2279",
    "findingId": "ransom",
    "evidenceIds": []
  },
  {
    "id": "B-R2425",
    "scenario": "B",
    "time": "11:57:40.0825587",
    "event": "Process Start: cscript.exe //nologo m.vbs; PPID 3888.",
    "pid": 6096,
    "source": "B_unreachable.csv · R2425",
    "findingId": "ransom",
    "evidenceIds": []
  },
  {
    "id": "B-R2617",
    "scenario": "B",
    "time": "11:57:40.1701372",
    "event": "SetRenameInformationFile: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\inventory.csv.WNCRYT; ReplaceIfExists: False, FileName: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\inventory.csv.WNCRY; SUCCESS.",
    "pid": 3760,
    "source": "B_unreachable.csv · R2617",
    "findingId": "files",
    "evidenceIds": [
      "E06",
      "E07"
    ]
  },
  {
    "id": "B-R2638",
    "scenario": "B",
    "time": "11:57:40.1730523",
    "event": "SetRenameInformationFile: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\lab_document.rtf.WNCRYT; ReplaceIfExists: False, FileName: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\lab_document.rtf.WNCRY; SUCCESS.",
    "pid": 3760,
    "source": "B_unreachable.csv · R2638",
    "findingId": "files",
    "evidenceIds": [
      "E06",
      "E07"
    ]
  },
  {
    "id": "B-R2659",
    "scenario": "B",
    "time": "11:57:40.1813166",
    "event": "SetRenameInformationFile: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\student_notes.txt.WNCRYT; ReplaceIfExists: False, FileName: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\student_notes.txt.WNCRY; SUCCESS.",
    "pid": 3760,
    "source": "B_unreachable.csv · R2659",
    "findingId": "files",
    "evidenceIds": [
      "E06",
      "E07"
    ]
  },
  {
    "id": "B-R279026",
    "scenario": "B",
    "time": "11:58:40.9514099",
    "event": "SetRenameInformationFile: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\inventory.csv; ReplaceIfExists: True, FileName: C:\\Windows\\Temp\\5.WNCRYT; SUCCESS.",
    "pid": 3760,
    "source": "B_unreachable.csv · R279026",
    "findingId": "files",
    "evidenceIds": [
      "E06",
      "E07"
    ]
  },
  {
    "id": "B-R279034",
    "scenario": "B",
    "time": "11:58:40.9523913",
    "event": "SetRenameInformationFile: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\lab_document.rtf; ReplaceIfExists: True, FileName: C:\\Windows\\Temp\\6.WNCRYT; SUCCESS.",
    "pid": 3760,
    "source": "B_unreachable.csv · R279034",
    "findingId": "files",
    "evidenceIds": [
      "E06",
      "E07"
    ]
  },
  {
    "id": "B-R279042",
    "scenario": "B",
    "time": "11:58:40.9531109",
    "event": "SetRenameInformationFile: C:\\Users\\bachdeptrai\\Documents\\IAM302_Decoys_20261008\\student_notes.txt; ReplaceIfExists: True, FileName: C:\\Windows\\Temp\\7.WNCRYT; SUCCESS.",
    "pid": 3760,
    "source": "B_unreachable.csv · R279042",
    "findingId": "files",
    "evidenceIds": [
      "E06",
      "E07"
    ]
  }
];
