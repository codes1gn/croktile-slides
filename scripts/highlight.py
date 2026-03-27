"""Convert fenced code blocks in Marp slides to syntax-highlighted HTML with editor chrome."""
import re
import sys
from html import escape

CHOREO_KEYWORDS = {
    "__co__", "__cok__", "__real_cok__", "__co_device__", "__device__",
    "parallel", "by", "with", "in", "foreach", "wait", "call", "select",
    "return", "where", "while", "break", "continue", "if", "else",
    "vectorize", "after", "cdiv", "inthreads", "for", "auto", "template",
    "inline", "extern", "const", "constexpr", "typename", "sizeof",
}

CHOREO_TYPES = {
    "void", "bool", "int", "half", "float", "double",
    "f64", "f32", "f16", "bf16", "f8", "f8_e4m3", "f8_e5m2",
    "f8_ue4m3", "f8_ue8m0", "f6_e3m2", "f4_e2m1", "tf32",
    "u64", "s64", "u32", "s32", "u16", "s16", "u8", "s8",
    "u6", "s6", "u4", "s4", "u2", "s2", "u1",
    "size_t", "char",
}

CHOREO_STORAGE = {
    "local", "shared", "global", "stream",
    "block", "group", "group-4", "thread", "device", "term", "mutable",
}

CHOREO_BUILTINS = {
    "dma", "tma", "mma", "sync", "trigger", "assert", "swap",
    "rotate", "print", "println", "frag", "stage", "event",
}

CHOREO_METHODS = {
    "copy", "transp", "pad", "swizzle", "swiz", "sp", "zfill", "any",
    "async", "span", "span_as", "mdata", "data", "view", "from",
    "chunkat", "chunk", "subspan", "modspan", "step", "stride", "at",
    "fill", "load", "store", "row", "col", "scale", "commit",
}

C_KEYWORDS = {
    "void", "int", "float", "double", "char", "unsigned", "signed",
    "long", "short", "const", "static", "extern", "inline", "volatile",
    "auto", "register", "return", "if", "else", "for", "while", "do",
    "switch", "case", "break", "continue", "default", "goto",
    "struct", "union", "enum", "typedef", "sizeof",
    "__global__", "__device__", "__shared__", "__syncthreads",
    "__half2float", "template", "constexpr", "typename",
    "#pragma", "unroll",
}


def tokenize_line(line, lang="choreo"):
    tokens = []
    pos = 0
    is_choreo = lang in ("choreo", "co", "")
    is_cpp = lang in ("cpp", "c", "cuda")

    keywords = CHOREO_KEYWORDS if is_choreo else C_KEYWORDS

    while pos < len(line):
        ch = line[pos]

        if ch == "/" and pos + 1 < len(line) and line[pos + 1] == "/":
            tokens.append(("cm", line[pos:]))
            break

        if ch == "#" and not is_cpp:
            m = re.match(r"^#(error|define|if|endif|include|pragma|elif|else)\b", line[pos:])
            if m:
                tokens.append(("kw", m.group(0)))
                pos += len(m.group(0))
                tokens.append(("sr", line[pos:]))
                break

        if ch == "#" and is_cpp:
            m = re.match(r"^#(error|define|if|endif|include|pragma|elif|else)\b", line[pos:])
            if m:
                tokens.append(("kw", m.group(0)))
                pos += len(m.group(0))
                tokens.append(("sr", line[pos:]))
                break

        if ch == '"':
            end = pos + 1
            while end < len(line) and line[end] != '"':
                if line[end] == "\\":
                    end += 1
                end += 1
            tokens.append(("sr", line[pos:end + 1]))
            pos = end + 1
            continue

        if ch == "'":
            end = pos + 1
            while end < len(line) and line[end] != "'":
                if line[end] == "\\":
                    end += 1
                end += 1
            tokens.append(("sr", line[pos:end + 1]))
            pos = end + 1
            continue

        if ch.isdigit() or (ch == "." and pos + 1 < len(line) and line[pos + 1].isdigit()):
            m = re.match(r"(\d+\.?\d*[fFeE]?[+-]?\d*[fF]?|0[xX][0-9a-fA-F]+)", line[pos:])
            if m:
                tokens.append(("nu", m.group(0)))
                pos += len(m.group(0))
                continue

        if re.match(r"[a-zA-Z_]", ch):
            m = re.match(r"[a-zA-Z_][a-zA-Z0-9_]*", line[pos:])
            if m:
                word = m.group(0)
                cls = ""
                if word in keywords:
                    cls = "kw"
                elif is_choreo and word in CHOREO_TYPES:
                    cls = "ty"
                elif is_choreo and word in CHOREO_STORAGE:
                    cls = "st"
                elif is_choreo and word in CHOREO_BUILTINS:
                    cls = "fn"
                elif is_cpp and word in C_KEYWORDS:
                    cls = "kw"
                tokens.append((cls, word))
                pos += len(word)
                continue

        if ch == "." and pos + 1 < len(line):
            m = re.match(r"[a-zA-Z_][a-zA-Z0-9_]*", line[pos + 1:])
            if m and is_choreo and m.group(0) in CHOREO_METHODS:
                tokens.append(("pu", "."))
                tokens.append(("fn", m.group(0)))
                pos += 1 + len(m.group(0))
                continue

        op2 = re.match(r"^(=>|==|!=|<=|>=|&&|\|\||<<|>>|\+\+|--)", line[pos:])
        if op2:
            tokens.append(("op", op2.group(0)))
            pos += len(op2.group(0))
            continue

        if re.match(r"[+\-*/%=<>&|!^~?:]", ch):
            tokens.append(("op", ch))
            pos += 1
            continue

        if re.match(r"[{}()\[\];,]", ch):
            tokens.append(("pu", ch))
            pos += 1
            continue

        tokens.append(("", ch))
        pos += 1

    return tokens


def highlight_code(code, lang="choreo"):
    lines = code.split("\n")
    html_lines = []
    for line in lines:
        parts = []
        for cls, text in tokenize_line(line, lang):
            t = escape(text)
            if cls:
                parts.append(f'<span class="hl-{cls}">{t}</span>')
            else:
                parts.append(t)
        html_lines.append("".join(parts))
    return "\n".join(html_lines)


def make_editor(code, lang="choreo", filename="", badge="", label=""):
    highlighted = highlight_code(code, lang)
    dots = (
        '<div class="editor-dots">'
        '<span class="dot-r"></span>'
        '<span class="dot-y"></span>'
        '<span class="dot-g"></span>'
        '</div>'
    )
    fn_html = f'<span class="editor-filename">{escape(filename)}</span>' if filename else ""
    badge_html = f'<span class="editor-badge">{escape(badge)}</span>' if badge else ""
    label_html = f'<div style="padding:6px 16px;border-top:1px solid var(--border);font-size:10px;color:var(--fg-secondary);font-family:\'JetBrains Mono\',monospace">{escape(label)}</div>' if label else ""

    return (
        f'<div class="editor">'
        f'<div class="editor-header">{dots}{fn_html}{badge_html}</div>'
        f'<pre><code>{highlighted}</code></pre>'
        f'{label_html}'
        f'</div>'
    )


CODE_BLOCK_RE = re.compile(
    r"```(\w*)\n(.*?)```",
    re.DOTALL,
)


def detect_lang(code):
    if "__global__" in code or "__shared__" in code or "CUtensorMap" in code or "cudaMemcpy" in code or "choreo::" in code:
        return "cpp"
    if "__co__" in code or "parallel" in code and ("block" in code or "group" in code):
        return "choreo"
    if "tma.copy" in code or "mma.fill" in code or "mma.load" in code or "dma.copy" in code:
        return "choreo"
    if "#error" in code or "#define" in code or "#if" in code:
        return "choreo"
    if "runtime_check" in code or "error:" in code:
        return "cpp"
    return "choreo"


def process_slides(text):
    def replace_block(m):
        lang = m.group(1)
        code = m.group(2).rstrip("\n")

        if lang in ("bash", "sh"):
            return m.group(0)

        if not lang:
            lang = detect_lang(code)

        fname = ""
        badge = ""
        if lang in ("choreo", "co"):
            fname = "kernel.co"
            badge = "CROKTILE"
        elif lang in ("cpp", "c", "cuda"):
            fname = "kernel.cu"
            badge = ""

        return make_editor(code, lang, filename=fname, badge=badge)

    return CODE_BLOCK_RE.sub(replace_block, text)


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <input.md> [output.md]")
        sys.exit(1)

    infile = sys.argv[1]
    outfile = sys.argv[2] if len(sys.argv) > 2 else infile

    with open(infile) as f:
        text = f.read()

    result = process_slides(text)

    with open(outfile, "w") as f:
        f.write(result)

    print(f"Processed {infile} -> {outfile}")


if __name__ == "__main__":
    main()
