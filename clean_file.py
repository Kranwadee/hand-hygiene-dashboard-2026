# Clean personal-dashboard.html by keeping only first 1666 lines (up to </html>)
with open('personal-dashboard.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only first 1666 lines
clean_lines = lines[:1666]

with open('personal-dashboard.html', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print(f"✅ Cleaned! Kept {len(clean_lines)} lines, removed {len(lines) - len(clean_lines)} corrupted lines")
