from PIL import Image, ImageFilter

im = Image.open(r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046619479_d5bf5116.jpg")
w, h = im.size

# The entire squircle card from original is from (w*0.245, h*0.245) to (w*0.755, h*0.755)
# Let's crop the full card:
card_full = im.crop((int(w * 0.245), int(h * 0.245), int(w * 0.755), int(h * 0.755)))
cw, ch = card_full.size
print(f"Card size: {cw}x{ch}")

# In card_full:
# Header is at top: y ~ 10 to 65
# Timeline text 0:52 is at y ~ 200 to 220, x ~ 25 to 70
# Timeline text -1:21 is at y ~ 200 to 220, x ~ cw - 70 to cw - 25
# Controls are at bottom: y ~ 240 to 290

# Let's clean the timeline text by cloning a 5px strip from just above (y ~ 190)
card_clean = card_full.copy()
# Patch "0:52"
strip_left = card_full.crop((20, 185, 80, 200))
card_clean.paste(strip_left, (20, 203))

# Patch "-1:21"
strip_right = card_full.crop((cw - 85, 185, cw - 20, 200))
card_clean.paste(strip_right, (cw - 85, 203))

# Patch progress line
strip_line = card_full.crop((20, 230, cw - 20, 238))
card_clean.paste(strip_line, (20, 222))

# Patch header text / pill if we want clean background
strip_top = card_full.crop((20, 75, cw - 20, 95))
for y in range(15, 75, 15):
    card_clean.paste(strip_top, (20, y))

card_clean.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_card_clean_bg.jpg")
print("Clean card background saved!")
