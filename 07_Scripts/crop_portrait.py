from PIL import Image
import os

img_path = r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046619479_d5bf5116.jpg"
im = Image.open(img_path)
w, h = im.size
print(f"Original size: {w}x{h}")

# The card squircle is roughly from (165, 165) to (515, 515)
# In this squircle:
# Header is at top: y ~ 170 to 240
# Controls are at bottom: y ~ 410 to 510
# The portrait itself without text is in y ~ 230 to 440, x ~ 180 to 500!
# Or we can clean the portrait or use portrait with background!
# Let's crop just the portrait area:
portrait = im.crop((int(w * 0.25), int(h * 0.32), int(w * 0.75), int(h * 0.64)))
portrait.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_portrait_clean.jpg")
print("Clean portrait cropped:", portrait.size)
