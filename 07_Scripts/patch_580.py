from PIL import Image, ImageDraw

im = Image.open(r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046619479_d5bf5116.jpg")
w, h = im.size
card = im.crop((int(w * 0.245), int(h * 0.245), int(w * 0.755), int(h * 0.755))).resize((580, 580), Image.Resampling.LANCZOS)

# Create an inpaint mask / patch for "0:52" and "-1:21"
# In 580x580:
# Left timestamp "0:52" is at x: 62 to 115, y: 340 to 365
# Right timestamp "-1:21" is at x: 465 to 518, y: 340 to 365
# We can sample the dark color from y: 375 and smoothly cover the two text blocks!
draw = ImageDraw.Draw(card)
# The dark background right below has color ~ rgb(32, 30, 36)
for y in range(342, 364):
    for x in range(65, 115):
        # sample from (x, y + 25)
        pixel = card.getpixel((x, y + 24))
        card.putpixel((x, y), pixel)

for y in range(342, 364):
    for x in range(465, 520):
        pixel = card.getpixel((x, y + 24))
        card.putpixel((x, y), pixel)

card.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_card_perfect_580.jpg")
print("Perfect 580x580 card saved!")
