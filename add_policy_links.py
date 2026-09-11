import re, os

# Add policy.html link to footer quick-links on all non-policy pages
# Pattern: find the last <a ...>Contact</a> in footer and add policy after it

POLICY_LINK = '<a href="policy.html" style="font-size:var(--font-sm); color:var(--text-secondary);">Privacy Policy</a>'

# Pages that have a footer with Contact link that needs policy added after
footer_contact_patterns = {
    'about.html': r'(<a href="contact\.html" style="font-size:var\(--font-sm\); color:var\(--text-secondary\);">Contact</a>)(\s*</div>)',
    'experience.html': None,  # will handle separately
    'certifications.html': None,  # will handle separately
    'contact.html': None,  # will handle separately  
    'projects.html': None,  # will handle separately
}

for fname in sorted(os.listdir('.')):
    if not fname.endswith('.html') or fname == 'policy.html':
        continue
    
    with open(fname, encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    if fname == 'about.html':
        # Add policy link after Contact in quick-links
        pattern = r'(<a href="contact\.html" style="font-size:var\(--font-sm\); color:var\(--text-secondary\);">Contact</a>)(\s*</div>)'
        replacement = r'\1\n                            <a href="policy.html" style="font-size:var(--font-sm); color:var(--text-secondary);">Privacy Policy</a>\2'
        content = re.sub(pattern, replacement, content)
    
    elif fname == 'experience.html':
        # experience.html has a minimal footer - add policy link before closing
        # Find the footer div's last text element
        pattern = r'(&copy; 20\d\d-\d\d\d\d Mohamed Abdelrahman\. All rights reserved\.)'
        replacement = r'\1\n            <div style="margin-top:var(--space-sm); font-size:var(--font-sm);">\n                <a href="policy.html" style="color:var(--primary-color);">Privacy Policy &amp; Terms</a>\n            </div>'
        content = re.sub(pattern, replacement, content)
    
    elif fname == 'certifications.html':
        # Find contact link in footer and add policy after
        pattern = r'(<a [^>]*href="contact\.html"[^>]*>Contact</a>)(\s*</div>\s*</div>\s*</div>)'
        replacement = r'\1\n                            <a href="policy.html" style="font-size:var(--font-sm); color:var(--text-secondary);">Privacy Policy</a>\2'
        content = re.sub(pattern, replacement, content)
    
    elif fname == 'contact.html':
        # Find the quick links section and add policy
        pattern = r'(<a href="index\.html"[^>]*>Home</a>.*?<a href="contact\.html"[^>]*>Contact</a>)(\s*</div>\s*</div>)'
        replacement = r'\1\n                            <a href="policy.html" style="font-size:var(--font-sm); color:var(--text-secondary);">Privacy Policy</a>\2'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    elif fname == 'projects.html':
        pattern = r'(<a [^>]*href="contact\.html"[^>]*>Contact</a>)(\s*</div>\s*</div>\s*</div>)'
        replacement = r'\1\n                            <a href="policy.html" style="font-size:var(--font-sm); color:var(--text-secondary);">Privacy Policy</a>\2'
        content = re.sub(pattern, replacement, content)
    
    elif fname == 'index.html':
        # Add policy link after Contact in nav
        pattern = r'(<a href="contact\.html" class="profile-link">.*?</a>)(\s*</nav>)'
        replacement = r'\1\n                <a href="policy.html" class="profile-link">\n                    <i class="fas fa-shield-alt"></i> Policy\n                </a>\2'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if content != original:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print('ADDED policy link: ' + fname)
    else:
        print('no change: ' + fname)

print('Done.')
