with open('department-dashboard.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only first 1129 lines (up to and including first </html>)
with open('department-dashboard.html', 'w', encoding='utf-8') as f:
    f.writelines(lines[:1129])

print("✅ Removed duplicate code. File now has 1129 lines.")
