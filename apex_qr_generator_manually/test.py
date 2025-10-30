import segno
import re

qr = segno.make("https://github.com")
qr.save("vercel_qr.svg", scale=10, border=1)

# Post-process: round the big finder squares
svg = open("vercel_qr.svg").read()

# Find all the <rect> elements that draw finder squares and add rx / ry
svg = re.sub(r'(<rect[^>]*width="[\d.]+"[^>]*height="[\d.]+"[^>]*)>',
             r'\1 rx="8" ry="8">', svg)

open("vercel_qr.svg", "w").write(svg)
print("✅ Saved vercel_qr.svg with rounded finder corners.")
