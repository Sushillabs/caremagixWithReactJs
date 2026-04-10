// content.js

function initCaremagix() {
  // duplicate injection (SPA safe)
  if (document.getElementById('caremagix-host')) return;

  // Host element (Shadow DOM for isolation)
  const host = document.createElement('div');
  host.id = 'caremagix-host';

  const shadow = host.attachShadow({ mode: 'open' });

  // Toggle Button
  const toggleBtn = document.createElement('div');
  toggleBtn.style.cssText = `
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 60px;
    background: #0F6E56;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px 0 0 8px;
    z-index: 2147483646;
    font-size: 20px;
    transition: right 0.3s ease;
  `;
  toggleBtn.innerHTML = '🏥';

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.style.cssText = `
    position: fixed;
    right: -400px;
    top: 0;
    width: 400px;
    height: 100vh;
    z-index: 2147483647;
    transition: right 0.3s ease;
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    background: white;
  `;

  // Iframe
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('index.html');

  iframe.allow = 'microphone';

  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;

  sidebar.appendChild(iframe);

  // Toggle Logic
  let isOpen = false;

  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;

    sidebar.style.right = isOpen ? '0px' : '-400px';
    toggleBtn.style.right = isOpen ? '400px' : '0px';
    toggleBtn.innerHTML = isOpen ? '✕' : '🏥';
  });

  // Append inside Shadow DOM
  shadow.appendChild(sidebar);
  shadow.appendChild(toggleBtn);

  document.body.appendChild(host);
}

// Safe load (important)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCaremagix);
} else {
  initCaremagix();
}