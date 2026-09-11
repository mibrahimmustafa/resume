import re, os

# Fix target="_blank" on internal page links (same-window navigation)
# These are profile links to about/experience/projects/certifications/contact pages

for fname in ['index.html', 'about.html', 'experience.html', 'certifications.html', 'contact.html', 'projects.html']:
    with open(fname, encoding='utf-8') as f:
        content = f.read()
    original = content
    
    # Remove target="_blank" rel="noopener noreferrer" from links to internal pages
    for internal_path in ['about.html', 'experience.html', 'projects.html', 'certifications.html', 'contact.html', './']:
        # Pattern: href="internal_path" ... target="_blank" ...
        pattern = re.compile(
            r'(href="' + re.escape(internal_path) + r'"[^>]*?)\s+target="_blank"(\s+rel="noopener noreferrer")?',
            re.DOTALL
        )
        content = pattern.sub(r'\1', content)
    
    if content != original:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print('FIXED: ' + fname)
    else:
        print('no change: ' + fname)

print('Done.')
