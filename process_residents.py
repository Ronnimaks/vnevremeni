import os
import shutil
import glob
import json

base_src_dir = r"C:\POET\НОВОВВЕДЕНИЯ\5 августа 2026\3\резиденты"
dest_img_dir = r"C:\POET\site\public\residents"
dest_data_file = r"C:\POET\site\src\data\residentsData.js"

# Create directories if they don't exist
os.makedirs(dest_img_dir, exist_ok=True)
os.makedirs(os.path.dirname(dest_data_file), exist_ok=True)

residents_data = []

for i in range(1, 10):
    folder_path = os.path.join(base_src_dir, str(i))
    if not os.path.exists(folder_path):
        continue
        
    # Find photo
    photo_files = glob.glob(os.path.join(folder_path, "*.jpg"))
    photo_name = ""
    if photo_files:
        src_photo = photo_files[0]
        dest_photo = os.path.join(dest_img_dir, f"resident_{i}.jpg")
        shutil.copy2(src_photo, dest_photo)
        photo_name = f"./residents/resident_{i}.jpg"
        
    # Read text
    text_files = glob.glob(os.path.join(folder_path, "*.txt"))
    name = f"Резидент {i}"
    description = ""
    role = "Резидент клуба"
    
    if text_files:
        try:
            with open(text_files[0], 'r', encoding='utf-8') as f:
                lines = f.readlines()
                if lines:
                    name = lines[0].strip()
                    # The rest is description
                    description = "\n".join([line.strip() for line in lines[1:] if line.strip()])
        except UnicodeDecodeError:
            with open(text_files[0], 'r', encoding='windows-1251') as f:
                lines = f.readlines()
                if lines:
                    name = lines[0].strip()
                    description = "\n".join([line.strip() for line in lines[1:] if line.strip()])
                    
    residents_data.append({
        "id": i,
        "name": name,
        "role": role,
        "description": description,
        "image": photo_name
    })

# Write to JS file
js_content = f"export const residentsData = {json.dumps(residents_data, ensure_ascii=False, indent=2)};\n"
with open(dest_data_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Processed {len(residents_data)} residents.")
