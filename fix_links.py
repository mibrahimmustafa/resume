import re, os

EXTERNAL_PATTERNS = [
    'linkedin.com', 'github.com', 'credly.com', 'wa.me',
    'scfhs.org.sa', 'vodafone.com.eg', 'huawei.com', 'its.ws',
    'verified.euclea-b-school.com', 'learn.microsoft.com',
    'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com', 'google.com',
]

INTERNAL_DOMAINS = [
    'mohamedabdelrahman.net', 'mohamedabdelrahman.com', 'mohamedabdelrahman.tech',
]

def is_external(href):
    return any(p in href for p in EXTERNAL_PATTERNS)

def is_internal(href):
    return any(d in href for d in INTERNAL_DOMAINS)

def fix_a_tag(m):
    full = m.group(0)
    hm = re.search(r'href="([^"]+)"', full)
    if not hm:
        return full
    href = hm.group(1)
    if not href.startswith('http'):
        return full
    
    changed = False
    new_href = href
    
    # Internal same-site absolute -> relative
    if is_internal(href):
        for dom in INTERNAL_DOMAINS:
            prefix = 'https://' + dom + '/'
            if href.startswith(prefix):
                path = href[len(prefix):]
                if path in ('', 'index.html', 'index.php'):
                    new_href = './'
                elif any(path.endswith(ext) for ext in ['.html', '.webp', '.pdf', '.png', '.jpg', '.svg']):
                    new_href = './' + path
                else:
                    new_href = './' + path
                changed = True
                break
    
    if changed:
        full = full.replace('href="' + href + '"', 'href="' + new_href + '"', 1)
        # Remove target="_blank" for same-site links (CHANGE 5)
        full = re.sub(r'\s+target="_blank"\s*(?:rel="noopener noreferrer")?', '', full)
        full = re.sub(r'\s+target="_blank"', '', full)
    elif is_external(href) and 'target="_blank"' not in full:
        # Ensure external links have target="_blank"
        if full.rstrip().endswith('/>'):
            full = full.replace('/>', ' target="_blank" rel="noopener noreferrer" />', 1)
        else:
            full = full.replace('>', ' target="_blank" rel="noopener noreferrer">', 1)
    
    return full

for fname in sorted(os.listdir('.')):
    if not fname.endswith('.html'):
        continue
    with open(fname, encoding='utf-8') as f:
        content = f.read()
    original = content
    content = re.sub(r'<a\s[^>]*>', fix_a_tag, content)
    if content != original:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print('CHANGED: ' + fname)
    else:
        print('no change: ' + fname)

print('Done.')
