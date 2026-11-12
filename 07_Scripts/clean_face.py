from PIL import Image

# Clean terence_photo_pure.jpg
im = Image.open(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_photo_pure.jpg")
w, h = im.size

# Let's crop only the actual face/shoulders without top pill and without bottom controls
# In the original 680x680:
# y=240 to y=415 is completely free of any text or controls!
im_orig = Image.open(r"C:\Users\ndara\.gemini\antigravity\brain\f364b63c-ad39-45fa-a997-a09cb113009f\.user_uploaded\media_1794046619479_d5bf5116.jpg")
w_orig, h_orig = im_orig.size

# Perfect clean portrait:
clean_face = im_orig.crop((int(w_orig * 0.25), int(h_orig * 0.355), int(w_orig * 0.745), int(h_orig * 0.605)))
clean_face.save(r"c:\Users\ndara\heygen-new\01_Assets\Images\terence_face_clean.jpg")
print("Clean face saved:", clean_face.size)
