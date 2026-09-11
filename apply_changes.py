import re, os

# ============================================================
# CHANGE 2: Add chatbot + WhatsApp to all pages
# ============================================================

chatbot_html = '''
    <!-- Chatbot Widget -->
    <div id="chatbot-container" class="chatbot-container">
        <div class="chatbot-header">
            <div class="chatbot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chatbot-info">
                <h3>Assistant</h3>
                <p>How can I help you?</p>
            </div>
            <button class="chatbot-close" id="chatbotClose" title="Close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="chatbot-body" id="chatbotBody">
            <div class="chatbot-greeting">
                <p>👋 Hi there! I'm here to answer any questions you might have about my experience, skills, or availability. Feel free to ask me anything!</p>
            </div>
            <div class="chatbot-quick-actions">
                <button class="chatbot-quick-btn" data-msg="What is your experience?">Experience</button>
                <button class="chatbot-quick-btn" data-msg="What certifications do you have?">Certifications</button>
                <button class="chatbot-quick-btn" data-msg="Are you available for freelance work?">Availability</button>
                <button class="chatbot-quick-btn" data-msg="How can I contact you?">Contact</button>
            </div>
        </div>
        <div class="chatbot-footer">
            <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Type a message..." aria-label="Chat message">
            <button class="chatbot-send" id="chatbotSend" title="Send">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
'''

whatsapp_html = '''
    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/966553346876" class="whatsapp-float" target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
        <i class="fab fa-whatsapp"></i>
    </a>
'''

back_home_html = '''
    <!-- Back to Home Button -->
    <a href="index.html" class="back-to-home" title="Back to Home">
        <i class="fas fa-home"></i>
        <span>Home</span>
    </a>
'''

def add_elements_to_page(content, fname):
    changed = False
    
    # Find the closing </body> tag
    body_close = '</body>'
    
    # Check what's already there
    has_chatbot = 'id="chatbot-container"' in content
    has_whatsapp = 'class="whatsapp-float"' in content
    has_back_home = 'class="back-to-home"' in content
    
    # Build what to insert before </body>
    insertions = []
    if not has_chatbot:
        insertions.append(chatbot_html)
    if not has_whatsapp:
        insertions.append(whatsapp_html)
    if not has_back_home and fname != 'index.html':
        insertions.append(back_home_html)
    
    if insertions:
        insert_block = '\n'.join(insertions) + '\n    '
        content = content.replace(body_close, insert_block + body_close, 1)
        changed = True
    
    return content, changed

# ============================================================
# CHANGE 5 & 6: Fix target=_blank and convert absolute to relative
# ============================================================

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

def fix_links(content):
    orig = content
    content = re.sub(r'<a\s[^>]*>', fix_a_tag, content)
    return content != orig, content

# ============================================================
# CHANGE 4: Highlight important links in index.html
# ============================================================

def highlight_links(content, fname):
    if fname != 'index.html':
        return content, False
    
    changed = False
    
    # 4a: Enhance "Click Experience for the full timeline..." link
    old1 = '<a href="experience.html">Experience</a> for the full timeline with detailed responsibilities and achievements.'
    new1 = '<a href="experience.html" class="highlight-cta">Experience</a> <span class="highlight-text">for the full timeline with detailed responsibilities and achievements.</span>'
    if old1 in content:
        content = content.replace(old1, new1)
        changed = True
    
    # 4b: Enhance "Click Certifications for the full list..." link
    old2 = '<a href="certifications.html">Certifications</a> for the full list with verification links.'
    new2 = '<a href="certifications.html" class="highlight-cta">Certifications</a> <span class="highlight-text">for the full list with verification links.</span>'
    if old2 in content:
        content = content.replace(old2, new2)
        changed = True
    
    # 4c: Enhance "Prefer a dedicated form? Visit the Contact page." link
    old3 = '<a href="contact.html">Visit the Contact page</a>.'
    new3 = '<a href="contact.html" class="highlight-cta">Visit the Contact page</a><span class="highlight-text">.</span>'
    if old3 in content:
        content = content.replace(old3, new3)
        changed = True
    
    return content, changed

# ============================================================
# Main processing
# ============================================================

files = sorted([f for f in os.listdir('.') if f.endswith('.html')])

for fname in files:
    with open(fname, encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    report = []
    
    # Add chatbot + WhatsApp + back-to-home
    content, changed = add_elements_to_page(content, fname)
    if changed:
        modified = True
        report.append('elements added')
    
    # Fix links
    changed, content = fix_links(content)
    if changed:
        modified = True
        report.append('links fixed')
    
    # Highlight important links (index only)
    content, changed = highlight_links(content, fname)
    if changed:
        modified = True
        report.append('links highlighted')
    
    if modified:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ {fname}: {", ".join(report)}')
    else:
        print(f'○ {fname}: no changes')

print('\nAll page-level changes complete.')
