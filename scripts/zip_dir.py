import os
import sys
import zipfile

def main():
    if len(sys.argv) < 3:
        print("Usage: python zip_dir.py <source_dir> <output_zip>")
        sys.exit(1)
    
    src = sys.argv[1]
    out = sys.argv[2]
    
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(src):
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, src)
                zf.write(full, rel)
                
    print(f"Packed: {out} ({os.path.getsize(out)} bytes)")

if __name__ == '__main__':
    main()
