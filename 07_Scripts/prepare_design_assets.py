import os
from PIL import Image

upload_dir = r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded"
assets_img_dir = r"c:\Users\ndara\heygen-new\01_Assets\Images"
os.makedirs(assets_img_dir, exist_ok=True)

img1_path = os.path.join(upload_dir, "media_1794046596429_ef7b4dfb.jpg")
img2_path = os.path.join(upload_dir, "media_1794046619479_d5bf5116.jpg")
img3_path = os.path.join(upload_dir, "media_1794046638896_036889e6.jpg")

# 1. Image 1 - Ask anything
im1 = Image.open(img1_path)
print(f"Image 1 size: {im1.size}")
im1.save(os.path.join(assets_img_dir, "ref_ask_anything_pill.jpg"))

# 2. Image 2 - Terence Howard Music Player
im2 = Image.open(img2_path)
w2, h2 = im2.size
print(f"Image 2 size: {w2}x{h2}")
im2.save(os.path.join(assets_img_dir, "ref_music_player.jpg"))

# Crop Terence Howard portrait inside the card
# The squircle is roughly centered in the square image
# Let's crop the art portion
crop_box = (int(w2 * 0.26), int(h2 * 0.26), int(w2 * 0.74), int(h2 * 0.74))
terence_art = im2.crop(crop_box)
terence_art.save(os.path.join(assets_img_dir, "terence_howard_artwork.jpg"))

# Also crop avatar if needed
avatar_crop = (int(w2 * 0.285), int(h2 * 0.285), int(w2 * 0.355), int(h2 * 0.355))
avatar_art = im2.crop(avatar_crop)
avatar_art.save(os.path.join(assets_img_dir, "terence_howard_avatar.jpg"))
print("Terence Howard artwork cropped.")

# 3. Image 3 - Travel cards
im3 = Image.open(img3_path)
w3, h3 = im3.size
print(f"Image 3 size: {w3}x{h3}")
im3.save(os.path.join(assets_img_dir, "ref_travel_carousel.jpg"))

# The 4 cards are distributed horizontally
# Card 1: Turkey (balloon)
# Card 2: Indonesia (rice terraces)
# Card 3: Dubai (Burj Al Arab)
# Card 4: Vietnam (mountains)
card_h_top = int(h3 * 0.22)
card_h_bottom = int(h3 * 0.76)

c1 = im3.crop((int(w3 * 0.0), int(h3 * 0.26), int(w3 * 0.23), int(h3 * 0.74)))
c1.save(os.path.join(assets_img_dir, "travel_card_turkey.jpg"))

c2 = im3.crop((int(w3 * 0.245), int(h3 * 0.26), int(w3 * 0.495), int(h3 * 0.74)))
c2.save(os.path.join(assets_img_dir, "travel_card_indonesia.jpg"))

c3 = im3.crop((int(w3 * 0.505), int(h3 * 0.22), int(w3 * 0.755), int(h3 * 0.70)))
c3.save(os.path.join(assets_img_dir, "travel_card_dubai.jpg"))

c4 = im3.crop((int(w3 * 0.77), int(h3 * 0.26), int(w3 * 1.0), int(h3 * 0.74)))
c4.save(os.path.join(assets_img_dir, "travel_card_vietnam.jpg"))
print("Travel cards cropped successfully.")
