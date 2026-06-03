"""
Prime Cane Group (Private) Limited — letterhead .docx generator.

Layered band + monogram design. The header is a three-band masthead
(deep-green hero band  +  cream eyebrow band  +  hairline lime rule) that
mirrors the web spec's brand system. The footer inverts it (hairline lime
rule  +  deep-green contact band  +  green-night strapline band with cane
icon mark).

Brand tokens come from primecane-coming-soon-spec.md §2.1 / §2.2.
Address: 7 Tweed Road, Eastlea, Harare, Zimbabwe (head office placeholder).

Run from the repo root:
    python3 scripts/generate-letterhead.py

Output:
    docs/PrimeCane-Letterhead.docx
"""

from pathlib import Path

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_ROW_HEIGHT_RULE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

# Page dimensions (A4)
PAGE_WIDTH_CM = 21.0
SIDE_MARGIN_CM = 2.5
CONTENT_WIDTH_CM = PAGE_WIDTH_CM - 2 * SIDE_MARGIN_CM  # 16cm

# Brand tokens (hex strings are the same colours, kept for OOXML shading)
GREEN_HEX = "184D2A"
GREEN_DEEP_HEX = "0F341C"
GREEN_NIGHT_HEX = "0A2414"
LIME_HEX = "D7DF23"
CREAM_HEX = "F3F1E7"   # warm cream sub-band (lighter than the cream used elsewhere)
GREEN_100_HEX = "E7ECE4"

GREEN = RGBColor(0x18, 0x4D, 0x2A)
GREEN_DEEP = RGBColor(0x0F, 0x34, 0x1C)
LIME = RGBColor(0xD7, 0xDF, 0x23)
INK = RGBColor(0x16, 0x3A, 0x25)
MIST = RGBColor(0x7C, 0x8C, 0x7E)
WHITE = RGBColor(0xFD, 0xFD, 0xFD)
CREAM = RGBColor(0xFD, 0xFD, 0xFD)

SERIF = "Fraunces"
GROTESK = "Hanken Grotesk"

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS = REPO_ROOT / "scripts" / "assets"
LOGO_SEC_PATH = ASSETS / "primecane-logo-sec.png"        # white-text emblem
LOGO_PRIMARY_PATH = ASSETS / "primecane-logo-primary.png"  # green-text emblem
ICON_PATH = ASSETS / "primecane-icon.png"
OUTPUT_PATH = REPO_ROOT / "docs" / "PrimeCane-Letterhead.docx"


# -------------------- low-level OOXML helpers --------------------

def set_cell_shading(cell, hex_fill):
    """Apply a solid background colour to a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_fill)
    tc_pr.append(shd)


def remove_cell_borders(cell):
    """Strip default table borders from a single cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        b = OxmlElement(f"w:{edge}")
        b.set(qn("w:val"), "nil")
        tc_borders.append(b)
    tc_pr.append(tc_borders)


def set_cell_margins(cell, top=120, bottom=120, left=200, right=200):
    """Cell margins in twentieths of a point (dxa)."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement("w:tcMar")
    for edge, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        m = OxmlElement(f"w:{edge}")
        m.set(qn("w:w"), str(val))
        m.set(qn("w:type"), "dxa")
        tc_mar.append(m)
    tc_pr.append(tc_mar)


def set_table_indent(table, indent_cm):
    """Indent a table. Negative values push it past the page's left margin."""
    tbl_pr = table._element.find(qn("w:tblPr"))
    if tbl_pr is None:
        tbl_pr = OxmlElement("w:tblPr")
        table._element.insert(0, tbl_pr)
    existing = tbl_pr.find(qn("w:tblInd"))
    if existing is not None:
        tbl_pr.remove(existing)
    tbl_ind = OxmlElement("w:tblInd")
    dxa = int(indent_cm * 1440 / 2.54)
    tbl_ind.set(qn("w:w"), str(dxa))
    tbl_ind.set(qn("w:type"), "dxa")
    tbl_pr.append(tbl_ind)


def add_lime_rule(parent, thickness_pt=3.0):
    """Edge-to-edge lime hairline rule — a thin 1-row table flush to page edges."""
    rule = parent.add_table(rows=1, cols=1, width=Cm(PAGE_WIDTH_CM))
    rule.autofit = False
    rule.columns[0].width = Cm(PAGE_WIDTH_CM)
    cell = rule.rows[0].cells[0]
    cell.width = Cm(PAGE_WIDTH_CM)
    remove_cell_borders(cell)
    set_cell_shading(cell, LIME_HEX)
    set_cell_margins(cell, top=0, bottom=0, left=0, right=0)

    row = rule.rows[0]
    row.height = Pt(thickness_pt)
    row.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY

    p = cell.paragraphs[0]
    tight_paragraph(p)
    # Tiny font keeps the row from forcing extra line height.
    run = p.add_run()
    run.font.size = Pt(1)

    set_table_indent(rule, -SIDE_MARGIN_CM)
    return rule


def add_horizontal_rule(paragraph, hex_color, size_pt=6):
    """Insert a coloured bottom border on a paragraph, used as a hairline rule."""
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size_pt))
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), hex_color)
    p_bdr.append(bottom)
    p_pr.append(p_bdr)


def set_run_font(run, name=GROTESK, size_pt=10, color=INK, bold=False,
                 spacing_pt=None, upper=False, italic=False):
    run.font.name = name
    run.font.size = Pt(size_pt)
    run.font.color.rgb = color
    run.font.bold = bold
    run.font.italic = italic
    r_pr = run._r.get_or_add_rPr()
    r_fonts = r_pr.find(qn("w:rFonts"))
    if r_fonts is None:
        r_fonts = OxmlElement("w:rFonts")
        r_pr.append(r_fonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        r_fonts.set(qn(attr), name)
    if spacing_pt is not None:
        spacing = OxmlElement("w:spacing")
        spacing.set(qn("w:val"), str(int(spacing_pt * 20)))
        r_pr.append(spacing)
    if upper:
        caps = OxmlElement("w:caps")
        caps.set(qn("w:val"), "true")
        r_pr.append(caps)


def tight_paragraph(p, space_before=0, space_after=0):
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    return p


# -------------------- header --------------------

def build_hero_band(parent):
    """
    Band 1: brand-green hero band, EDGE-TO-EDGE across the page.
    5-column table: [left page-edge spacer | logo | address | right spacer | right page-edge spacer]
    Spacer columns match the page side margins so content inside the band still
    aligns with the body copy below.
    """
    logo_w = CONTENT_WIDTH_CM * 0.55   # 8.8 cm
    addr_w = CONTENT_WIDTH_CM * 0.45   # 7.2 cm
    col_widths_cm = [SIDE_MARGIN_CM, logo_w, addr_w, SIDE_MARGIN_CM]
    table = parent.add_table(rows=1, cols=4, width=Cm(PAGE_WIDTH_CM))
    table.autofit = False
    for i, w in enumerate(col_widths_cm):
        table.columns[i].width = Cm(w)

    cells = table.rows[0].cells
    for cell, w in zip(cells, col_widths_cm):
        cell.width = Cm(w)
        remove_cell_borders(cell)
        set_cell_shading(cell, GREEN_HEX)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    edge_left, left, right, edge_right = cells
    # Edge spacers carry no content; tighten margins so they don't add padding.
    for edge in (edge_left, edge_right):
        set_cell_margins(edge, top=0, bottom=0, left=0, right=0)
        tight_paragraph(edge.paragraphs[0])
    set_cell_margins(left, top=260, bottom=260, left=320, right=320)
    set_cell_margins(right, top=260, bottom=260, left=320, right=320)

    set_table_indent(table, -SIDE_MARGIN_CM)

    # Logo (white-text emblem) on green band
    lp = tight_paragraph(left.paragraphs[0])
    lp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    lr = lp.add_run()
    lr.add_picture(str(LOGO_SEC_PATH), height=Cm(2.4))

    # Right block: eyebrow + address
    rp = tight_paragraph(right.paragraphs[0])
    rp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    eyebrow = rp.add_run("HEAD OFFICE")
    set_run_font(eyebrow, name=GROTESK, size_pt=7.5, color=LIME, bold=True, spacing_pt=2.2)

    for line in ("7 Tweed Road", "Eastlea, Harare", "Zimbabwe"):
        p = tight_paragraph(right.add_paragraph(), space_before=2)
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        run = p.add_run(line)
        set_run_font(run, name=GROTESK, size_pt=9.5, color=WHITE)

    contact_p = tight_paragraph(right.add_paragraph(), space_before=8)
    contact_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    contact_run = contact_p.add_run("info@primecane.com   ·   primecane.com")
    set_run_font(contact_run, name=GROTESK, size_pt=9, color=LIME)


def build_eyebrow_band(parent, width_cm=16.0):
    """
    Band 2: thin cream micro-band, eyebrow left + contact right.
    """
    table = parent.add_table(rows=1, cols=2, width=Cm(width_cm))
    table.autofit = False
    table.columns[0].width = Cm(width_cm * 0.55)
    table.columns[1].width = Cm(width_cm * 0.45)
    left, right = table.rows[0].cells
    left.width = Cm(width_cm * 0.55)
    right.width = Cm(width_cm * 0.45)

    for cell in (left, right):
        remove_cell_borders(cell)
        set_cell_shading(cell, CREAM_HEX)
        set_cell_margins(cell, top=120, bottom=120, left=320, right=320)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    lp = tight_paragraph(left.paragraphs[0])
    lp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    left_run = lp.add_run("SUSTAINABLE  AGRICULTURAL  SOLUTIONS")
    set_run_font(left_run, name=GROTESK, size_pt=7.5, color=GREEN, bold=True, spacing_pt=2.2)

    rp = tight_paragraph(right.paragraphs[0])
    rp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    right_run = rp.add_run("info@primecane.com   ·   primecane.com")
    set_run_font(right_run, name=GROTESK, size_pt=8.5, color=GREEN)


def build_header(section):
    header = section.header
    for p in list(header.paragraphs):
        p._element.getparent().remove(p._element)

    build_hero_band(header)


# -------------------- footer --------------------

def build_footer(section):
    footer = section.footer
    for p in list(footer.paragraphs):
        p._element.getparent().remove(p._element)

    # Brand-green strapline band, EDGE-TO-EDGE.
    # Row 1 (5 cols):
    #   [left page-edge spacer | icon | strapline (centered) | right spacer | right page-edge spacer]
    # Row 2: all cells merged for the centered legal line.
    icon_w = 2.2
    spacer_w = 2.2  # mirrors icon for true page-centered strapline
    strap_w = CONTENT_WIDTH_CM - icon_w - spacer_w  # 11.6 cm
    col_widths_cm = [SIDE_MARGIN_CM, icon_w, strap_w, spacer_w, SIDE_MARGIN_CM]

    strap_table = footer.add_table(rows=2, cols=5, width=Cm(PAGE_WIDTH_CM))
    strap_table.autofit = False
    for i, w in enumerate(col_widths_cm):
        strap_table.columns[i].width = Cm(w)

    # --- Row 1 ---
    row1 = strap_table.rows[0].cells
    for cell, w in zip(row1, col_widths_cm):
        cell.width = Cm(w)
        remove_cell_borders(cell)
        set_cell_shading(cell, GREEN_HEX)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    edge_l1, icon_cell, strap_cell, spacer_cell, edge_r1 = row1

    for edge in (edge_l1, edge_r1):
        set_cell_margins(edge, top=0, bottom=0, left=0, right=0)
        tight_paragraph(edge.paragraphs[0])
    for cell in (icon_cell, strap_cell, spacer_cell):
        set_cell_margins(cell, top=80, bottom=40, left=200, right=200)

    ip = tight_paragraph(icon_cell.paragraphs[0])
    ip.alignment = WD_ALIGN_PARAGRAPH.LEFT
    irun = ip.add_run()
    irun.add_picture(str(ICON_PATH), height=Cm(0.75))

    sp = tight_paragraph(strap_cell.paragraphs[0])
    sp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    srun = sp.add_run("PURE   ·   NATURAL   ·   PREMIUM")
    set_run_font(srun, name=GROTESK, size_pt=10, color=LIME, bold=True, spacing_pt=3.0)

    tight_paragraph(spacer_cell.paragraphs[0])

    # --- Row 2: merge all 5 cells for a fully-centered legal line ---
    r2 = strap_table.rows[1].cells
    legal_cell = r2[0]
    for other in r2[1:]:
        legal_cell = legal_cell.merge(other)
    remove_cell_borders(legal_cell)
    set_cell_shading(legal_cell, GREEN_HEX)
    set_cell_margins(legal_cell, top=10, bottom=80, left=200, right=200)
    legal_cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    lgp = tight_paragraph(legal_cell.paragraphs[0])
    lgp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    lgrun = lgp.add_run("© 2026 Prime Cane Group (Private) Limited")
    set_run_font(lgrun, name=GROTESK, size_pt=7.5, color=WHITE, spacing_pt=1.0)

    set_table_indent(strap_table, -SIDE_MARGIN_CM)


# -------------------- body --------------------

def build_body(doc):
    """Letter skeleton with placeholders."""
    spacer = tight_paragraph(doc.add_paragraph(), space_after=0)
    _ = spacer

    date_p = tight_paragraph(doc.add_paragraph(), space_after=18)
    date_run = date_p.add_run("[Date]")
    set_run_font(date_run, name=GROTESK, size_pt=10.5, color=MIST)

    for placeholder in ("[Recipient Name]", "[Title]", "[Company]",
                        "[Address Line 1]", "[Address Line 2]"):
        p = tight_paragraph(doc.add_paragraph(), space_after=0)
        run = p.add_run(placeholder)
        set_run_font(run, name=GROTESK, size_pt=10.5, color=MIST)

    sal_p = tight_paragraph(doc.add_paragraph(), space_before=20, space_after=12)
    sal_run = sal_p.add_run("Dear [Name],")
    set_run_font(sal_run, name=GROTESK, size_pt=11, color=INK)

    subj_p = tight_paragraph(doc.add_paragraph(), space_after=14)
    subj_run = subj_p.add_run("Re: [Subject]")
    set_run_font(subj_run, name=SERIF, size_pt=13, color=GREEN, bold=True)

    body_p = tight_paragraph(doc.add_paragraph(), space_after=12)
    body_p.paragraph_format.line_spacing = 1.45
    body_run = body_p.add_run(
        "[Body text. Use Hanken Grotesk at 11pt for letter copy. Keep the tone "
        "short, confident and grounded — Pure · Natural · Premium.]"
    )
    set_run_font(body_run, name=GROTESK, size_pt=11, color=INK)

    signoff_p = tight_paragraph(doc.add_paragraph(), space_before=24)
    signoff_run = signoff_p.add_run("Yours sincerely,")
    set_run_font(signoff_run, name=GROTESK, size_pt=11, color=INK)

    for _ in range(3):
        tight_paragraph(doc.add_paragraph(), space_after=0)

    name_p = tight_paragraph(doc.add_paragraph(), space_after=0)
    name_run = name_p.add_run("[Your Name]")
    set_run_font(name_run, name=GROTESK, size_pt=11, color=INK, bold=True)

    title_p = tight_paragraph(doc.add_paragraph(), space_after=0)
    title_run = title_p.add_run("[Your Title]   ·   Prime Cane Group (Private) Limited")
    set_run_font(title_run, name=GROTESK, size_pt=10, color=MIST)


# -------------------- page setup --------------------

def configure_page(section):
    section.page_height = Cm(29.7)
    section.page_width = Cm(21.0)
    # Tight top/bottom to let the bands hug the page edges
    section.top_margin = Cm(0.0)
    section.bottom_margin = Cm(0.0)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
    section.header_distance = Cm(0.0)
    section.footer_distance = Cm(0.0)


# -------------------- main --------------------

def main():
    for path in (LOGO_SEC_PATH, LOGO_PRIMARY_PATH, ICON_PATH):
        if not path.exists():
            raise FileNotFoundError(f"Asset missing: {path}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    doc = Document()
    normal = doc.styles["Normal"]
    normal.font.name = GROTESK
    normal.font.size = Pt(11)
    normal.font.color.rgb = INK

    section = doc.sections[0]
    configure_page(section)

    build_header(section)
    build_footer(section)

    # Push body content below the header band visually
    for _ in range(4):
        tight_paragraph(doc.add_paragraph(), space_after=0)

    build_body(doc)

    doc.save(OUTPUT_PATH)
    print(f"Wrote letterhead → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
