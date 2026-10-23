#!/usr/bin/env python3
"""
Build the digital business cards from scripts/cards/people.json.

For each person it writes:
  public/card/<slug>/index.html   the card page (served at /card/<slug>/)
  public/card/<slug>/<slug>.vcf   the "Save to Contacts" file
and it keeps two generated blocks up to date:
  public/_redirects   /<alias> -> /card/<slug>/  (must sit above the SPA catch-all)
  public/_headers     text/vcard MIME type for each .vcf (without it, phones
                      show the file as text instead of offering to save it)

Shared assets live in public/card/assets/ (logo, fonts, card.js). The site's CSP
is script-src 'self', so the card page must not carry inline script; the Share
button is wired up by card.js.

Needs segno for the QR code:
  pip install segno        # or reuse any venv that has it
  python3 scripts/generate-cards.py
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

import segno

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts" / "cards" / "people.json"
PUBLIC = ROOT / "public"

BEGIN = "# BEGIN generated cards (scripts/generate-cards.py)"
END = "# END generated cards"

# Lucide-style 24px stroke icons.
ICONS = {
    "phone": '<path d="M15.5 21A13.5 13.5 0 0 1 3 8.5 3 3 0 0 1 6 5.5h1.6a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.3.95l-1.3 1.2a12 12 0 0 0 4.85 4.85l1.2-1.3a1 1 0 0 1 .95-.3l3 .7a1 1 0 0 1 .8 1V18a3 3 0 0 1-3 3Z"/>',
    "mail": '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3.5 7 7.6 5.3a2 2 0 0 0 2.3 0L21 7"/>',
    "web": '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
    "pin": '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    "save": '<path d="M12 3v12"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/>',
    "share": '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>',
    "qr": '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z"/>',
    "chev": '<path d="m6 9 6 6 6-6"/>',
}


def icon(name: str, cls: str = "ic") -> str:
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" '
        f'aria-hidden="true">{ICONS[name]}</svg>'
    )


def e(s: str) -> str:
    return html.escape(s, quote=True)


def tel_href(number: str) -> str:
    return "tel:" + re.sub(r"[^\d+]", "", number)


def address_line(addr: dict) -> str:
    parts = [addr.get(k, "") for k in ("street", "city", "region", "postcode", "country")]
    return ", ".join(p for p in parts if p)


def vcard_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;")


def build_vcard(p: dict, co: dict) -> str:
    a = co["address"]
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{vcard_escape(p['lastName'])};{vcard_escape(p['firstName'])};;;",
        f"FN:{vcard_escape(p['firstName'] + ' ' + p['lastName'])}",
        f"ORG:{vcard_escape(co['name'])}",
        f"TITLE:{vcard_escape(p['title'])}",
    ]
    lines += [f"TEL;TYPE=CELL,VOICE:{n}" for n in p.get("phones", [])]
    if p.get("email"):
        lines.append(f"EMAIL;TYPE=INTERNET,WORK:{p['email']}")
    lines.append(f"URL:{co['website']}")
    adr = ";".join(
        vcard_escape(a.get(k, "")) for k in ("street", "city", "region", "postcode", "country")
    )
    lines.append(f"ADR;TYPE=WORK:;;{adr}")
    lines.append("END:VCARD")
    # vCard wants CRLF line endings.
    return "\r\n".join(lines) + "\r\n"


def qr_svg(url: str) -> str:
    qr = segno.make(url, error="m")
    return qr.svg_inline(dark="#0a2414", light=None, border=2, omitsize=True, svgclass="qr-svg")


CSS = """
@font-face {
  font-family: 'Fraunces Card';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(/card/assets/fonts/fraunces.woff2) format('woff2');
}
@font-face {
  font-family: 'Hanken Card';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(/card/assets/fonts/hanken-grotesk.woff2) format('woff2');
}
:root {
  --bg: #0a2414;
  --surface: #0f341c;
  --line: #24543a;
  --text: #fdfdfd;
  --muted: #a9bba9;
  --lime: #d7df23;
  --green-soft: #8ec97a;
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 1.5rem 1rem 2.5rem;
  background:
    radial-gradient(120% 70% at 50% -10%, #184d2a 0%, rgba(24, 77, 42, 0) 60%),
    var(--bg);
  color: var(--text);
  font-family: 'Hanken Card', ui-sans-serif, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
.card { width: 100%; max-width: 26rem; }
.hd {
  display: flex; align-items: center; gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--line);
}
.logo { display: block; width: 4.5rem; height: auto; flex: none; }
.co { display: grid; gap: .1rem; }
.co-nm {
  font-family: 'Fraunces Card', Georgia, 'Times New Roman', serif;
  font-weight: 600; font-size: 1.2rem; line-height: 1.2;
}
.co-tag {
  color: var(--green-soft); font-size: .72rem; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
}
.nm {
  font-family: 'Fraunces Card', Georgia, 'Times New Roman', serif;
  font-weight: 600;
  font-size: clamp(1.7rem, 7.5vw, 2.2rem);
  line-height: 1.1;
  letter-spacing: -.01em;
  margin: 1.6rem 0 0;
}
.bar { width: 2.6rem; height: 3px; background: var(--lime); border-radius: 2px; margin-top: .9rem; }
.ti { color: var(--muted); margin: .7rem 0 0; font-size: .95rem; }
.rows { margin-top: 1.4rem; display: grid; gap: .25rem; }
.rw {
  display: flex; align-items: center; gap: .85rem;
  min-height: 3rem; padding: .5rem .75rem; margin-inline: -.75rem;
  border-radius: .5rem; color: inherit; text-decoration: none;
  transition: background-color 160ms ease;
}
a.rw:hover, a.rw:focus-visible { background: var(--surface); }
.rw .ic { width: 1.25rem; height: 1.25rem; flex: none; color: var(--lime); }
.rw-lbl { overflow-wrap: anywhere; }
.acts { margin-top: 1.75rem; display: flex; flex-wrap: wrap; gap: .75rem; }
.btn {
  flex: 1 1 auto; min-height: 3rem;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .75rem 1.1rem; border-radius: 999px;
  font: inherit; font-weight: 600; font-size: .95rem;
  cursor: pointer; text-decoration: none;
  transition: opacity 160ms ease, background-color 160ms ease;
}
.btn .ic { width: 1.1rem; height: 1.1rem; }
.btn-primary { background: var(--lime); color: var(--bg); border: 0; }
.btn-primary:hover { opacity: .9; }
.btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.btn-ghost:hover { background: var(--surface); }
.qr { margin-top: 1.5rem; }
.qr-toggle {
  display: flex; align-items: center; gap: .5rem;
  min-height: 2.75rem; cursor: pointer; list-style: none;
  color: var(--muted); font-size: .9rem;
}
.qr-toggle::-webkit-details-marker { display: none; }
.qr-toggle .ic { width: 1.1rem; height: 1.1rem; }
.chev { width: 1rem; height: 1rem; transition: transform 180ms ease; }
.qr[open] .chev { transform: rotate(180deg); }
.qr .lbl-hide { display: none; }
.qr[open] .lbl-show { display: none; }
.qr[open] .lbl-hide { display: inline; }
.qr-body { display: grid; justify-items: center; gap: .6rem; padding-top: .5rem; }
.qr-plate { background: var(--text); padding: .75rem; border-radius: .75rem; }
.qr-svg { display: block; width: 11rem; height: auto; }
.qr-cap { margin: 0; color: var(--muted); font-size: .8rem; }
.foot {
  margin-top: 2rem; padding-top: 1rem;
  border-top: 1px solid var(--line);
  color: var(--muted); font-size: .78rem;
}
.toast {
  position: fixed; left: 50%; bottom: 1.25rem; transform: translate(-50%, 1rem);
  background: var(--surface); color: var(--text);
  border: 1px solid var(--line); border-radius: .5rem;
  padding: .6rem 1rem; font-size: .85rem;
  opacity: 0; pointer-events: none; transition: opacity 200ms ease, transform 200ms ease;
}
.toast.on { opacity: 1; transform: translate(-50%, 0); }
:focus-visible { outline: 2px solid var(--lime); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
""".strip()


def build_page(p: dict, co: dict, base: str) -> str:
    full = f"{p['firstName']} {p['lastName']}"
    page_title = f"{full} | {co['name']}"
    card_url = f"{base}/card/{p['slug']}/"
    share_url = f"{base}/{p['alias']}" if p.get("alias") else card_url

    rows = []
    for n in p.get("phones", []):
        rows.append(f'<a class="rw" href="{tel_href(n)}">{icon("phone")}<span class="rw-lbl">{e(n)}</span></a>')
    if p.get("email"):
        rows.append(f'<a class="rw" href="mailto:{e(p["email"])}">{icon("mail")}<span class="rw-lbl">{e(p["email"])}</span></a>')
    rows.append(f'<a class="rw" href="{e(co["website"])}">{icon("web")}<span class="rw-lbl">{e(co["websiteLabel"])}</span></a>')
    rows.append(f'<div class="rw">{icon("pin")}<span class="rw-lbl">{e(address_line(co["address"]))}</span></div>')
    rows_html = "\n    ".join(rows)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(page_title)}</title>
<meta name="description" content="{e(full)}, {e(p['title'])} at {e(co['name'])}.">
<!-- GENERATED by scripts/generate-cards.py. Edit scripts/cards/people.json, not this file.
     noindex on purpose: this page carries a named person's direct numbers. It is
     meant to be handed over by link, QR or NFC, not found in search. -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="{e(card_url)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0a2414">
<meta property="og:type" content="profile">
<meta property="og:title" content="{e(page_title)}">
<meta property="og:description" content="{e(p['title'])}">
<meta property="og:url" content="{e(card_url)}">
<meta property="og:image" content="{e(base)}/og-image.png">
<link rel="preload" href="/card/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<style>
{CSS}
</style>
</head>
<body>
<main class="card">
  <header class="hd">
    <img class="logo" src="/card/assets/primecane-logo.svg" alt="Prime Cane Group" width="211" height="203">
    <div class="co">
      <span class="co-nm">{e(co['name'])}</span>
      <span class="co-tag">{e(co['tagline'])}</span>
    </div>
  </header>

  <h1 class="nm">{e(full)}</h1>
  <div class="bar" aria-hidden="true"></div>
  <p class="ti">{e(p['title'])}</p>

  <div class="rows">
    {rows_html}
  </div>

  <div class="acts">
    <a class="btn btn-primary" href="{e(p['slug'])}.vcf" type="text/vcard" download>{icon("save")}Save to Contacts</a>
    <button class="btn btn-ghost" id="share" type="button" data-title="{e(page_title)}" data-url="{e(share_url)}">{icon("share")}<span>Share</span></button>
  </div>

  <details class="qr">
    <summary class="qr-toggle">{icon("qr")}<span class="lbl-show">Show QR code</span><span class="lbl-hide">Hide QR code</span>{icon("chev", "chev")}</summary>
    <div class="qr-body">
      <div class="qr-plate">{qr_svg(share_url)}</div>
      <p class="qr-cap">Scan to open this card</p>
    </div>
  </details>

  <footer class="foot">{e(co['legalName'])}</footer>
</main>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="/card/assets/card.js" defer></script>
</body>
</html>
"""


def replace_block(path: Path, block: str, at_top: bool) -> None:
    text = path.read_text() if path.exists() else ""
    pattern = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n*", re.S)
    text = pattern.sub("", text)
    wrapped = f"{BEGIN}\n{block.rstrip()}\n{END}\n\n"
    text = wrapped + text if at_top else text.rstrip() + "\n\n" + wrapped
    path.write_text(text.rstrip() + "\n")


def main() -> None:
    data = json.loads(DATA.read_text())
    co, base, people = data["company"], data["baseUrl"].rstrip("/"), data["people"]

    redirects, headers = [], []
    for p in people:
        out = PUBLIC / "card" / p["slug"]
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text(build_page(p, co, base))
        (out / f"{p['slug']}.vcf").write_bytes(build_vcard(p, co).encode("utf-8"))
        if p.get("alias"):
            redirects.append(f"/{p['alias']} /card/{p['slug']}/ 301")
        headers.append(
            f"/card/{p['slug']}/{p['slug']}.vcf\n"
            "  Content-Type: text/vcard; charset=utf-8\n"
            "  Cache-Control: public, max-age=300"
        )
        print(f"card: /card/{p['slug']}/" + (f"  alias: /{p['alias']}" if p.get("alias") else ""))

    # Aliases go first: the SPA catch-all (/* /index.html 200) would swallow them otherwise.
    replace_block(PUBLIC / "_redirects", "\n".join(redirects), at_top=True)
    replace_block(PUBLIC / "_headers", "\n\n".join(headers), at_top=False)


if __name__ == "__main__":
    main()
