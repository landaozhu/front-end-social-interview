#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser


class _TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self._chunks = []

    def handle_data(self, data):
        if data:
            self._chunks.append(data)

    def get_text(self):
        text = "\n".join(self._chunks)
        text = html.unescape(text)
        return text


class _TableExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self._in_tr = False
        self._in_cell = False
        self._cell_chunks = []
        self._rows = []
        self._current_row = []

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._in_tr = True
            self._current_row = []
        if self._in_tr and tag in ("td", "th"):
            self._in_cell = True
            self._cell_chunks = []
        if self._in_cell and tag in ("br",):
            self._cell_chunks.append("\n")

    def handle_endtag(self, tag):
        if tag == "tr" and self._in_tr:
            self._in_tr = False
            if self._current_row:
                self._rows.append(self._current_row)
            self._current_row = []
        if self._in_tr and tag in ("td", "th") and self._in_cell:
            self._in_cell = False
            raw = "".join(self._cell_chunks)
            text = html.unescape(raw)
            lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
            text = "\n".join([line for line in lines if line])
            self._current_row.append(text)
            self._cell_chunks = []

    def handle_data(self, data):
        if self._in_cell and data:
            self._cell_chunks.append(data)

    def get_rows(self):
        return self._rows


def _parse_page_id_from_url(url):
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)
    page_ids = qs.get("pageId") or qs.get("pageid") or []
    if page_ids:
        return page_ids[0]
    return None


def _build_cookie_header(cookie_text):
    cookie_text = (cookie_text or "").strip()
    if not cookie_text:
        return None
    if cookie_text.lower().startswith("cookie:"):
        cookie_text = cookie_text.split(":", 1)[1].strip()
    return cookie_text


def _load_cookie_from_file(cookie_file_path):
    with open(cookie_file_path, "r", encoding="utf-8") as f:
        raw = f.read()
    raw = raw.strip()
    if not raw:
        return None
    return raw


def _http_get_json(url, cookie_header_value):
    req = urllib.request.Request(url, method="GET")
    req.add_header("Accept", "application/json")
    if cookie_header_value:
        req.add_header("Cookie", cookie_header_value)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        detail = ""
        try:
            detail = e.read().decode("utf-8", errors="replace")
        except Exception:
            pass
        raise RuntimeError(f"HTTP {e.code} when fetching {url}\n{detail}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network error when fetching {url}: {e}") from e


def _fetch_confluence_storage_html(page_id, cookie_header_value):
    api_url = f"https://wiki.maoyan.com/rest/api/content/{urllib.parse.quote(str(page_id))}?expand=body.storage,title"
    data = _http_get_json(api_url, cookie_header_value)
    storage = (((data or {}).get("body") or {}).get("storage") or {}).get("value") or ""
    title = (data or {}).get("title") or ""
    return title, storage


def _fetch_confluence_child_page_ids(page_id, cookie_header_value, limit=200):
    start = 0
    ids = []
    while True:
        api_url = (
            f"https://wiki.maoyan.com/rest/api/content/{urllib.parse.quote(str(page_id))}/child/page"
            f"?limit={int(limit)}&start={int(start)}"
        )
        data = _http_get_json(api_url, cookie_header_value)
        results = (data or {}).get("results") or []
        for it in results:
            cid = (it or {}).get("id")
            if cid:
                ids.append(str(cid))
        size = (data or {}).get("size")
        if isinstance(size, int) and size < limit:
            break
        if not results:
            break
        start += len(results)
    return ids


def _storage_html_to_text(storage_html):
    parser = _TextExtractor()
    parser.feed(storage_html or "")
    text = parser.get_text()
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return lines


_QUESTION_PATTERNS = [
    re.compile(r"^(题目|问题)\s*[:：]\s*(.+)$"),
    re.compile(r"^Q\s*[:：]\s*(.+)$", re.IGNORECASE),
]
_ANSWER_PATTERNS = [
    re.compile(r"^(答案|解答)\s*[:：]\s*(.+)$"),
    re.compile(r"^A\s*[:：]\s*(.+)$", re.IGNORECASE),
]


def _extract_qa(lines):
    items = []
    i = 0
    while i < len(lines):
        line = lines[i]
        q = None
        for pat in _QUESTION_PATTERNS:
            m = pat.match(line)
            if m:
                q = (m.group(2) or "").strip()
                break
        if not q:
            i += 1
            continue

        a = None
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            for apat in _ANSWER_PATTERNS:
                am = apat.match(next_line)
                if am:
                    a = (am.group(2) or "").strip()
                    break
        items.append({"question": q, "answer": a})
        i += 1 if a is None else 2
    return items


def _extract_qa_from_storage_tables(storage_html):
    if not storage_html:
        return []
    parser = _TableExtractor()
    parser.feed(storage_html)
    rows = parser.get_rows()
    if not rows:
        return []

    header_row_idx = None
    question_col = None
    answer_col = None
    remark_col = None
    question_header_text = ""
    for ridx, row in enumerate(rows):
        qcol = None
        acol = None
        rcol = None
        for idx, cell in enumerate(row):
            if cell == "题目" or ("题目" in cell):
                qcol = idx
                question_header_text = cell or ""
            if cell == "回答":
                acol = idx
            if cell == "备注":
                rcol = idx
        if qcol is not None:
            header_row_idx = ridx
            question_col = qcol
            answer_col = acol
            remark_col = rcol
            break
    if header_row_idx is None or question_col is None:
        return []

    def _is_valid_question_text(text):
        t = (text or "").replace("\u00a0", " ")
        t = re.sub(r"\s+", " ", t).strip()
        if not t:
            return False
        if re.fullmatch(r"[0-9]+(\.[0-9]+)?", t):
            return False
        if t in ("-", "—", "—-", "incomplete", "不清楚", "没问", "看有没有权限", "0", "1", "2", "3", "4", "5"):
            return False
        if t.startswith("不清楚"):
            return False
        if t.startswith("没问"):
            return False
        if len(t) < 3:
            return False
        return True

    def _parse_question_cell(cell_text):
        raw = (cell_text or "").replace("\u00a0", " ")
        parts = [re.sub(r"\s+", " ", p).strip() for p in raw.splitlines()]
        parts = [p for p in parts if p]
        if not parts:
            return "", None
        parts = [p for p in parts if not re.fullmatch(r"[0-9]+(\.[0-9]+)?", p)]
        parts = [p for p in parts if p.lower() not in ("incomplete", "complete", "pass", "fail")]
        if not parts:
            return "", None
        q = parts[0].strip()
        a = "\n".join([p.strip() for p in parts[1:] if p.strip()]) or None
        return q, a

    items = []
    for row in rows[header_row_idx + 1 :]:
        if question_col >= len(row):
            continue
        q, a = _parse_question_cell(row[question_col])
        if not _is_valid_question_text(q):
            continue
        if answer_col is not None and answer_col < len(row):
            a = (row[answer_col] or "").strip() or None
        items.append({"question": q, "answer": a})
    return items


def _read_file_text(path):
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _has_question(existing_text, question):
    if not question:
        return True
    title = f"### {question}"
    if title in existing_text:
        return True
    return question in existing_text


def _append_items(target_md, items):
    existing = _read_file_text(target_md)
    new_items = []
    added_titles = set()
    for it in items:
        q = (it.get("question") or "").strip()
        a = (it.get("answer") or "")
        a = a.strip() if a is not None else None
        if not q:
            continue
        if q in added_titles:
            continue
        if _has_question(existing, q):
            continue
        added_titles.add(q)
        new_items.append({"question": q, "answer": a})

    if not new_items:
        return 0

    with open(target_md, "a", encoding="utf-8") as f:
        if existing and not existing.endswith("\n"):
            f.write("\n")
        for it in new_items:
            f.write(f"\n### {it['question']}\n")
            if it["answer"]:
                f.write(f"{it['answer']}\n")
    return len(new_items)


def main(argv):
    parser = argparse.ArgumentParser(description="Sync wiki Q&A into local markdown (append only).")
    parser.add_argument("--url", default="", help="Confluence page URL containing pageId=...")
    parser.add_argument("--page-id", default="", help="Confluence pageId")
    parser.add_argument("--target-md", required=True, help="Local markdown file path to append questions")
    args = parser.parse_args(argv)

    page_id = (args.page_id or "").strip()
    if not page_id and args.url:
        page_id = _parse_page_id_from_url(args.url) or ""
    if not page_id:
        raise SystemExit("Missing --page-id (or --url containing pageId=...)")

    cookie = os.environ.get("CONFLUENCE_COOKIE", "")
    cookie_file = os.environ.get("CONFLUENCE_COOKIE_FILE", "")
    if not cookie and cookie_file:
        cookie = _load_cookie_from_file(cookie_file)
    cookie_header_value = _build_cookie_header(cookie)

    if not cookie_header_value:
        raise SystemExit("Missing Confluence login cookie. Set CONFLUENCE_COOKIE or CONFLUENCE_COOKIE_FILE.")

    _, storage_html = _fetch_confluence_storage_html(page_id, cookie_header_value)
    items = _extract_qa_from_storage_tables(storage_html)
    if not items:
        lines = _storage_html_to_text(storage_html)
        items = _extract_qa(lines)
    if not items:
        child_ids = _fetch_confluence_child_page_ids(page_id, cookie_header_value)
        for cid in child_ids:
            _, child_storage_html = _fetch_confluence_storage_html(cid, cookie_header_value)
            child_items = _extract_qa_from_storage_tables(child_storage_html)
            if not child_items:
                child_lines = _storage_html_to_text(child_storage_html)
                child_items = _extract_qa(child_lines)
            items.extend(child_items)
    appended = _append_items(args.target_md, items)
    print(f"Extracted: {len(items)}; appended: {appended}; target: {args.target_md}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

