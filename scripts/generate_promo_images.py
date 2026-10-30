"""
scripts/generate_promo_images.py
Generates Apple-style high-resolution promotional banners for Chrome Web Store and Firefox AMO.
- promo/promo-hero-1280x800.png (Overview & Before/After)
- promo/promo-speed-1280x800.png (Quota Saver & 11B Limiter)
- promo/promo-dns-1280x800.png (Family Shield & Content Filtering)
- promo/promo-marquee-440x280.png (Small Promo Tile)
"""

import os
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMO_DIR = os.path.join(ROOT_DIR, 'promo')
os.makedirs(PROMO_DIR, exist_ok=True)

def get_font(size, bold=False):
    # Try system fonts
    font_names = ["segoeui.ttf", "arial.ttf", "tahoma.ttf"]
    if bold:
        font_names = ["segoeuib.ttf", "arialbd.ttf", "tahomabd.ttf"]
    for name in font_names:
        try:
            return ImageFont.truetype(name, size)
        except:
            continue
    return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def generate_hero():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (10, 12, 16, 255))
    draw = ImageDraw.Draw(img)

    # Ambient subtle gradients
    for r in range(400, 0, -20):
        alpha = int(35 * (1 - r / 400))
        draw.ellipse([w//2 - r, -100 - r, w//2 + r, -100 + r], fill=(0, 113, 227, alpha))

    # Header Title
    f_title = get_font(44, bold=True)
    f_sub = get_font(22, bold=False)
    f_badge = get_font(16, bold=True)

    title_text = "Universal Router Hub (NextGen Dashboard)"
    draw.text((w//2, 80), title_text, fill=(245, 245, 247, 255), font=f_title, anchor="mm")
    
    sub_text = "Modern Apple-like Dashboard & Speed Controller for Routers in Egypt & Middle East"
    draw.text((w//2, 135), sub_text, fill=(134, 134, 139, 255), font=f_sub, anchor="mm")

    # Badges row
    badges = ["Wi-Fi Speed Limiter", "Family DNS Shield", "Auto-Detect Hardware", "Zero Telemetry"]
    bx = 320
    for b in badges:
        draw_rounded_rect(draw, [bx, 175, bx + 150, 205], radius=15, fill=(28, 28, 30, 200), outline=(255, 255, 255, 30))
        draw.text((bx + 75, 190), b, fill=(0, 113, 227, 255), font=f_badge, anchor="mm")
        bx += 165

    # Center Glass Mockup Card
    cx, cy = 160, 240
    cw, ch = 960, 480
    draw_rounded_rect(draw, [cx, cy, cx + cw, cy + ch], radius=24, fill=(20, 22, 28, 240), outline=(255, 255, 255, 35), width=2)

    # Topbar of the card
    draw_rounded_rect(draw, [cx, cy, cx + cw, cy + 60], radius=24, fill=(28, 30, 36, 255))
    draw.rectangle([cx, cy + 30, cx + cw, cy + 60], fill=(28, 30, 36, 255))
    draw.line([cx, cy + 60, cx + cw, cy + 60], fill=(255, 255, 255, 25), width=1)

    # Logo in mockup
    draw_rounded_rect(draw, [cx + 20, cy + 12, cx + 56, cy + 48], radius=8, fill=(0, 113, 227, 255))
    draw.text((cx + 70, cy + 30), "Universal Router Hub", fill=(245, 245, 247), font=get_font(18, bold=True), anchor="lm")
    draw.text((cx + 280, cy + 30), "D-Link / ZTE / Huawei / TP-Link", fill=(134, 134, 139), font=get_font(14), anchor="lm")

    # Status Pill
    draw_rounded_rect(draw, [cx + cw - 120, cy + 16, cx + cw - 20, cy + 44], radius=14, fill=(52, 199, 89, 40), outline=(52, 199, 89, 100))
    draw.text((cx + cw - 70, cy + 30), "Online", fill=(52, 199, 89), font=get_font(13, bold=True), anchor="mm")

    # Card 1 inside Mockup: DSL Stats
    draw_rounded_rect(draw, [cx + 30, cy + 85, cx + 465, cy + 340], radius=16, fill=(28, 30, 36, 200), outline=(255, 255, 255, 25))
    draw.text((cx + 50, cy + 115), "Physical Line Speed (VDSL2)", fill=(134, 134, 139), font=get_font(15, bold=True), anchor="lm")
    draw.text((cx + 50, cy + 165), "30.7", fill=(0, 113, 227), font=get_font(42, bold=True), anchor="lm")
    draw.text((cx + 155, cy + 172), "Mbps Download", fill=(134, 134, 139), font=get_font(16), anchor="lm")
    draw.text((cx + 50, cy + 220), "Upload Speed: 3.1 Mbps", fill=(245, 245, 247), font=get_font(14), anchor="lm")
    draw.text((cx + 50, cy + 250), "SNR Margin: 11.3 dB (Stable)", fill=(52, 199, 89), font=get_font(14), anchor="lm")
    draw.text((cx + 50, cy + 280), "MSAN Distance: ~1100 meters", fill=(134, 134, 139), font=get_font(14), anchor="lm")

    # Card 2 inside Mockup: Wi-Fi Speed Limiter
    draw_rounded_rect(draw, [cx + 495, cy + 85, cx + 930, cy + 340], radius=16, fill=(28, 30, 36, 200), outline=(255, 255, 255, 25))
    draw.text((cx + 515, cy + 115), "Quota Protection (Bandwidth Limiter)", fill=(134, 134, 139), font=get_font(15, bold=True), anchor="lm")
    draw_rounded_rect(draw, [cx + 515, cy + 145, cx + 910, cy + 220], radius=12, fill=(255, 149, 0, 30), outline=(255, 149, 0, 120))
    draw.text((cx + 535, cy + 170), "11B Only Mode (~5 Mbps)", fill=(255, 149, 0), font=get_font(18, bold=True), anchor="lm")
    draw.text((cx + 535, cy + 195), "Caps high-bandwidth streaming & saves monthly gigabytes", fill=(134, 134, 139), font=get_font(12), anchor="lm")
    draw_rounded_rect(draw, [cx + 515, cy + 245, cx + 910, cy + 295], radius=12, fill=(0, 113, 227, 255))
    draw.text((cx + 712, cy + 270), "Apply Speed Limiter", fill=(255, 255, 255), font=get_font(15, bold=True), anchor="mm")

    # Bottom bar of card
    draw_rounded_rect(draw, [cx + 30, cy + 360, cx + 930, cy + 440], radius=14, fill=(52, 199, 89, 20), outline=(52, 199, 89, 60))
    draw.text((cx + 60, cy + 400), "Safe Family DNS Protection: Cloudflare 1.1.1.3 Active (Blocks Adult/Phishing)", fill=(52, 199, 89), font=get_font(15, bold=True), anchor="lm")

    out_path = os.path.join(PROMO_DIR, "promo-hero-1280x800.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

def generate_speed_promo():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (12, 14, 20, 255))
    draw = ImageDraw.Draw(img)

    f_title = get_font(40, bold=True)
    f_sub = get_font(20)

    draw.text((w//2, 80), "Universal 802.11 Speed Limiter & Quota Saver", fill=(245, 245, 247), font=f_title, anchor="mm")
    draw.text((w//2, 130), "Protect your monthly internet quota from TikTok, 4K streaming & video downloads", fill=(134, 134, 139), font=f_sub, anchor="mm")

    # 3 Mode Cards Comparison
    modes = [
        {"title": "11B Only Mode", "speed": "~5 Mbps", "color": (255, 149, 0), "desc": "Caps download speeds automatically.\nIdeal for protecting monthly quota."},
        {"title": "11G Only Mode", "speed": "~20 Mbps", "color": (0, 113, 227), "desc": "Smooth 1080p Full HD video playback\nwith balanced data consumption."},
        {"title": "Mixed 11N/AC", "speed": "Full Speed", "color": (52, 199, 89), "desc": "Unrestricted maximum line speed\nfor heavy gaming and file downloads."}
    ]

    cx = 120
    for m in modes:
        draw_rounded_rect(draw, [cx, 200, cx + 320, 680], radius=20, fill=(28, 30, 36, 230), outline=(255, 255, 255, 30), width=2)
        draw.text((cx + 160, 250), m["title"], fill=(245, 245, 247), font=get_font(22, bold=True), anchor="mm")
        draw.text((cx + 160, 330), m["speed"], fill=m["color"], font=get_font(38, bold=True), anchor="mm")
        draw.multiline_text((cx + 160, 420), m["desc"], fill=(134, 134, 139), font=get_font(15), anchor="mm", align="center")
        draw_rounded_rect(draw, [cx + 30, 580, cx + 290, 630], radius=14, fill=m["color"])
        draw.text((cx + 160, 605), "1-Click Switch", fill=(255, 255, 255), font=get_font(15, bold=True), anchor="mm")
        cx += 360

    out_path = os.path.join(PROMO_DIR, "promo-speed-1280x800.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

def generate_dns_promo():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (10, 12, 18, 255))
    draw = ImageDraw.Draw(img)

    f_title = get_font(40, bold=True)
    f_sub = get_font(20)

    draw.text((w//2, 80), "Family Shield DNS & Content Filtering", fill=(245, 245, 247), font=f_title, anchor="mm")
    draw.text((w//2, 130), "One-click router-wide security to block phishing, malware & adult content", fill=(134, 134, 139), font=f_sub, anchor="mm")

    presets = [
        ("Cloudflare Family (1.1.1.3)", "Blocks malware, phishing & adult content router-wide with lowest ping.", (0, 113, 227)),
        ("AdGuard Family Filter", "Blocks annoying popups, ad trackers & forces Google SafeSearch.", (88, 86, 214)),
        ("CleanBrowsing Security", "Strict parental filter blocking proxy bypasses and pornographic domains.", (52, 199, 89)),
        ("Quad9 Threat Defense (9.9.9.9)", "Global cyber-security intelligence against ransomware & botnets.", (255, 149, 0))
    ]

    cy = 190
    for title, desc, color in presets:
        draw_rounded_rect(draw, [180, cy, 1100, cy + 105], radius=16, fill=(28, 30, 36, 240), outline=(255, 255, 255, 25), width=1)
        draw_rounded_rect(draw, [200, cy + 22, 260, cy + 82], radius=12, fill=color)
        draw.text((280, cy + 38), title, fill=(245, 245, 247), font=get_font(18, bold=True), anchor="lm")
        draw.text((280, cy + 68), desc, fill=(134, 134, 139), font=get_font(14), anchor="lm")
        draw_rounded_rect(draw, [960, cy + 32, 1070, cy + 72], radius=10, fill=(255, 255, 255, 15), outline=color)
        draw.text((1015, cy + 52), "Enable", fill=color, font=get_font(14, bold=True), anchor="mm")
        cy += 125

    out_path = os.path.join(PROMO_DIR, "promo-dns-1280x800.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

def generate_small_tile():
    w, h = 440, 280
    img = Image.new("RGBA", (w, h), (10, 12, 16, 255))
    draw = ImageDraw.Draw(img)

    # Logo
    draw_rounded_rect(draw, [w//2 - 28, 35, w//2 + 28, 91], radius=14, fill=(0, 113, 227, 255))
    draw.text((w//2, 125), "Universal Router Hub", fill=(245, 245, 247), font=get_font(20, bold=True), anchor="mm")
    draw.text((w//2, 155), "Smart Router Dashboard & Speed Limiter", fill=(134, 134, 139), font=get_font(12), anchor="mm")

    # Features pill
    draw_rounded_rect(draw, [50, 190, 390, 230], radius=12, fill=(28, 30, 36, 255), outline=(0, 113, 227, 100))
    draw.text((w//2, 210), "Quota Saver • Family DNS • 1-Click Login", fill=(0, 113, 227), font=get_font(12, bold=True), anchor="mm")

    out_path = os.path.join(PROMO_DIR, "promo-marquee-440x280.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

if __name__ == '__main__':
    generate_hero()
    generate_speed_promo()
    generate_dns_promo()
    generate_small_tile()
    print("All promo assets generated successfully!")
