from PIL import Image

# 1. TRAVEL CARDS CLEAN SCENIC CROPS
im3 = Image.open(r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046638896_036889e6.jpg")
w3, h3 = im3.size

# Crop pure scenery (above the text area which starts around y=0.55*h3)
# Card 1: Turkey balloon
c1_photo = im3.crop((int(w3 * 0.0), int(h3 * 0.27), int(w3 * 0.23), int(h3 * 0.58)))
c1_photo.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\travel_photo_turkey.jpg")

# Card 2: Indonesia rice terrace
c2_photo = im3.crop((int(w3 * 0.245), int(h3 * 0.27), int(w3 * 0.49), int(h3 * 0.58)))
c2_photo.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\travel_photo_indonesia.jpg")

# Card 3: Dubai Burj Al Arab
c3_photo = im3.crop((int(w3 * 0.505), int(h3 * 0.23), int(w3 * 0.755), int(h3 * 0.54)))
c3_photo.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\travel_photo_dubai.jpg")

# Card 4: Vietnam mountain
c4_photo = im3.crop((int(w3 * 0.77), int(h3 * 0.27), int(w3 * 1.0), int(h3 * 0.58)))
c4_photo.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\travel_photo_vietnam.jpg")
print("Clean travel photos cropped.")

# 2. TERENCE HOWARD CLEAN PHOTO
im2 = Image.open(r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046619479_d5bf5116.jpg")
w2, h2 = im2.size
# Crop pure photo between header and timeline
t_photo = im2.crop((int(w2 * 0.26), int(h2 * 0.35), int(w2 * 0.74), int(h2 * 0.62)))
t_photo.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_photo_pure.jpg")
print("Pure photo cropped.")
