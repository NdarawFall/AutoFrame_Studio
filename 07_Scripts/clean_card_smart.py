from PIL import Image

im = Image.open(r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046619479_d5bf5116.jpg")
w, h = im.size

# Crop the natural card without disturbing Terence's hair or the header
card = im.crop((int(w * 0.245), int(h * 0.245), int(w * 0.755), int(h * 0.755)))
cw, ch = card.size

# Only hide the static timestamps 0:52 and -1:21 using nearby pixels
# 0:52 is at x=25..65, y=200..215
patch_left = card.crop((25, 225, 65, 235)).resize((40, 18))
card.paste(patch_left, (25, 202))

# -1:21 is at x=cw-65..cw-25, y=200..215
patch_right = card.crop((cw-65, 225, cw-25, 235)).resize((40, 18))
card.paste(patch_right, (cw-65, 202))

card.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_card_smart.jpg")
print("Smart card saved without any hair/header artifacts!")
