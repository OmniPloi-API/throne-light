#!/bin/bash
# Build script for Tauri - creates a minimal static reader app

set -e

echo "Building Throne Light Reader for Tauri..."

# Create output directory
rm -rf out
mkdir -p out

# Copy public assets
cp -r public/* out/

# Create a simple HTML entry point for the reader
cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Throne Light Reader</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #f5f5dc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      padding: 2rem;
      width: 100%;
      max-width: 720px;
    }
    h1 {
      color: #c9a961;
      font-size: 2rem;
      margin: 0.5rem 0 1.5rem;
    }
    p {
      color: #999;
      margin: 0;
    }
    .logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.25rem;
    }
    .message {
      background: rgba(201, 169, 97, 0.1);
      border: 1px solid rgba(201, 169, 97, 0.3);
      border-radius: 8px;
      padding: 1.5rem;
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }
    .title {
      color: #c9a961;
      font-weight: 700;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 0.5rem;
    }
    .btn {
      appearance: none;
      border: 1px solid rgba(201, 169, 97, 0.35);
      background: rgba(201, 169, 97, 0.16);
      color: #f5f5dc;
      padding: 0.6rem 0.9rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
    }
    .btn.secondary {
      background: transparent;
      border-color: rgba(201, 169, 97, 0.22);
      color: #c9a961;
    }
    .server {
      width: 100%;
      max-width: 560px;
      margin: 0.5rem auto 0;
      display: none;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .server input {
      width: min(520px, 100%);
      padding: 0.55rem 0.7rem;
      border-radius: 10px;
      border: 1px solid rgba(201, 169, 97, 0.28);
      background: rgba(255, 255, 255, 0.06);
      color: #f5f5dc;
      outline: none;
    }
    .hint {
      color: rgba(245, 245, 220, 0.55);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="images/THRONELIGHT-LOGO.png" alt="Throne Light" class="logo">
    <h1>Throne Light Reader</h1>
    <div class="message">
      <p class="title" id="statusTitle"></p>
      <p id="statusBody"></p>
      <div class="actions">
        <button class="btn" id="primaryButton" type="button"></button>
        <button class="btn secondary" id="secondaryButton" type="button">Change server</button>
      </div>
    </div>

    <div class="server" id="serverPanel">
      <input id="serverInput" type="url" inputmode="url" spellcheck="false" />
      <button class="btn" id="saveServer" type="button">Save</button>
      <div class="hint">Set this to your staging or production reader URL (example: https://your-domain.com/reader/home)</div>
    </div>
  </div>

  <script>
    (function () {
      var DEFAULT_URL = '__TL_READER_URL__';
      var STORAGE_KEY = 'tl_reader_url_v2';
      var LEGACY_KEY = 'tl_reader_url';
      var stored = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      try {
        var legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy && /thronelight\.com/i.test(legacy)) {
          localStorage.removeItem(LEGACY_KEY);
        }
      } catch (e) {}
      if (stored && /thronelight\.com/i.test(stored)) {
        stored = null;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      }
      var readerUrl = stored || DEFAULT_URL;
      if (/thronelight\.com/i.test(readerUrl)) {
        readerUrl = DEFAULT_URL;
        try { localStorage.setItem(STORAGE_KEY, readerUrl); } catch (e) {}
      }

      var titleEl = document.getElementById('statusTitle');
      var bodyEl = document.getElementById('statusBody');
      var primaryBtn = document.getElementById('primaryButton');
      var secondaryBtn = document.getElementById('secondaryButton');
      var serverPanel = document.getElementById('serverPanel');
      var serverInput = document.getElementById('serverInput');
      var saveBtn = document.getElementById('saveServer');

      serverInput.value = readerUrl;

      function openReader() {
        window.location.href = readerUrl;
      }

      function checkConnectivity() {
        titleEl.textContent = 'Checking connection…';
        bodyEl.textContent = '';
        primaryBtn.textContent = 'Retry';
        primaryBtn.onclick = function () { checkConnectivity(); };

        var controller = null;
        var timeoutId = null;
        try {
          controller = new AbortController();
          timeoutId = setTimeout(function () { controller.abort(); }, 2500);
        } catch (e) {}

        var init = {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        };
        if (controller) init.signal = controller.signal;

        fetch(readerUrl, init)
          .then(function () {
            if (timeoutId) clearTimeout(timeoutId);
            setOnline();
          })
          .catch(function () {
            if (timeoutId) clearTimeout(timeoutId);
            setOffline();
          });
      }

      function setOnline() {
        titleEl.textContent = 'Opening your library…';
        bodyEl.textContent = '';
        primaryBtn.textContent = 'Open now';
        primaryBtn.onclick = openReader;
        setTimeout(openReader, 600);
      }

      function setOffline() {
        titleEl.textContent = 'Internet required';
        bodyEl.textContent = 'Connect to the internet to access your books.';
        primaryBtn.textContent = 'Retry';
        primaryBtn.onclick = function () {
          checkConnectivity();
        };
      }

      function toggleServerPanel() {
        var next = serverPanel.style.display === 'flex' ? 'none' : 'flex';
        serverPanel.style.display = next;
      }

      secondaryBtn.onclick = toggleServerPanel;

      saveBtn.onclick = function () {
        var nextUrl = (serverInput.value || '').trim();
        if (!nextUrl) return;
        readerUrl = nextUrl;
        try { localStorage.setItem(STORAGE_KEY, readerUrl); } catch (e) {}
        serverPanel.style.display = 'none';
        checkConnectivity();
      };

      window.addEventListener('online', function () { checkConnectivity(); });
      window.addEventListener('offline', function () { setOffline(); });

      checkConnectivity();
    })();
  </script>
</body>
</html>
EOF

READER_URL_DEFAULT="${TL_READER_URL:-https://thronelightpublishing.com/reader/home}"
perl -0777 -i -pe "s#__TL_READER_URL__#${READER_URL_DEFAULT}#g" out/index.html

echo "✓ Static build complete in ./out"
