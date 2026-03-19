import codecs
import re

# 1. Update index.html
with codecs.open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

modal_html = """
        <!-- Download CV Modal -->
        <div id="downloadCvModal" class="cv-modal-overlay">
            <div class="cv-modal-content">
                <span class="cv-modal-close" id="closeCvModal">&times;</span>
                <h3>Download My CV</h3>
                <p>Please provide your details below to instantly download my professional CV.</p>
                <form id="downloadCvForm" class="contact-form">
                    <div class="form-group">
                        <label for="cvName">Full Name</label>
                        <input type="text" id="cvName" placeholder="Your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="cvEmail">Email Address</label>
                        <input type="email" id="cvEmail" placeholder="Your email address" required>
                    </div>
                    <div class="form-group">
                        <label for="cvPhone">Phone Number</label>
                        <input type="tel" id="cvPhone" placeholder="Your phone number" required>
                    </div>
                    <button type="submit" class="btn-primary" id="submitCvDownload" style="width: 100%;">
                        <i class="fas fa-download"></i> Get CV
                    </button>
                    <p id="cvDownloadStatus" class="status-message" style="display: none; margin-top: 15px; text-align: center; font-weight: bold;"></p>
                </form>
            </div>
        </div>
"""

# insert before <script src="script.js">
if 'id="downloadCvModal"' not in html:
    html = html.replace('<script src="script.js"></script>', modal_html + '\n        <script src="script.js"></script>')
    with codecs.open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)


# 2. Update style.css
with codecs.open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

modal_css = """
/* ===== CV DOWNLOAD MODAL ===== */
.cv-modal-overlay {
  display: none; 
  position: fixed; 
  z-index: 100000; 
  left: 0;
  top: 0;
  width: 100%; 
  height: 100%; 
  overflow: auto; 
  background-color: rgba(0,0,0,0.6); 
  backdrop-filter: blur(5px);
  justify-content: center;
  align-items: center;
}

.cv-modal-overlay.active {
  display: flex;
}

.cv-modal-content {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 30px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease-out;
  border: 1px solid var(--border-color);
}

[data-theme="dark"] .cv-modal-content {
  background: rgba(33, 37, 41, 0.98);
}

.cv-modal-close {
  color: var(--text-secondary);
  position: absolute;
  right: 20px;
  top: 15px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  transition: 0.2s;
}

.cv-modal-close:hover,
.cv-modal-close:focus {
  color: var(--primary-color);
  text-decoration: none;
}

.cv-modal-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--text-primary);
  padding-right: 20px;
}

.cv-modal-content p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
"""
if 'cv-modal-overlay' not in css:
    with codecs.open('style.css', 'a', encoding='utf-8') as f:
        f.write('\n' + modal_css + '\n')


# 3. Update script.js
with codecs.open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

target_pattern = re.compile(r'function setupDownloadButton\(\) \{.*?(?=\/\*\*|\Z)', re.DOTALL)

replacement_js = """function setupDownloadButton() {
    const downloadButton = document.getElementById("download-btn");
    const modal = document.getElementById("downloadCvModal");
    const closeBtn = document.getElementById("closeCvModal");
    const downloadForm = document.getElementById("downloadCvForm");
    const statusMsg = document.getElementById("cvDownloadStatus");
    
    if (!downloadButton || !modal) return;

    downloadButton.addEventListener("click", function(e) {
        e.preventDefault();
        modal.classList.add("active");
        statusMsg.style.display = "none";
    });

    closeBtn.addEventListener("click", function() {
        modal.classList.remove("active");
    });

    window.addEventListener("click", function(e) {
        if (e.target == modal) {
            modal.classList.remove("active");
        }
    });

    downloadForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const btn = document.getElementById("submitCvDownload");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
        
        const name = document.getElementById("cvName").value.trim();
        const email = document.getElementById("cvEmail").value.trim();
        const phone = document.getElementById("cvPhone").value.trim();

        fetch("https://c1vps004.4topapps.com/webhook/downloadCV", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullname: name,
                email: email,
                phone: phone,
                source: window.location.hostname || "mohamedabdelrahman",
                timestamp: new Date().toISOString()
            })
        })
        .then(() => {
            statusMsg.innerText = "Success! Your download is starting...";
            statusMsg.style.color = "#2ed573";
            statusMsg.style.display = "block";
            
            const fileLink = document.createElement("a");
            fileLink.href = "MohamedAbdelrahman.pdf";
            fileLink.download = "MohamedAbdelrahman.pdf";
            fileLink.click();
            
            setTimeout(() => {
                modal.classList.remove("active");
                downloadForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        })
        .catch(err => {
            console.error("Webhook error:", err);
            statusMsg.innerText = "Error connecting, but starting download...";
            statusMsg.style.color = "#ff6b6b";
            statusMsg.style.display = "block";
            
            const fileLink = document.createElement("a");
            fileLink.href = "MohamedAbdelrahman.pdf";
            fileLink.download = "MohamedAbdelrahman.pdf";
            fileLink.click();
            
            setTimeout(() => {
                modal.classList.remove("active");
                downloadForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        });
    });
}

"""

if pattern := target_pattern.search(js):
    js = target_pattern.sub(replacement_js, js)
    with codecs.open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Download modal system initialized.")
else:
    print("Could not find setupDownloadButton")
