const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('../apps/gym/node_modules/puppeteer-core');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const DIST_DIR = path.resolve(__dirname, '../apps/admin/dist');
const OUT_DIR_ARTIFACTS = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fa029df2-cd44-42c3-8e9d-7f1afb1cc882';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startServer(port = 4201) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      let filePath = path.join(DIST_DIR, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

async function capture() {
  const server = await startServer(4201);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Master Data without horizontal scrollbar indicator
  await page.goto('http://127.0.0.1:4201/master-data', { waitUntil: 'networkidle0' });
  // Click on Amenities & Facilities tab just like the user's screenshot
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const t = tabs.find(el => el.textContent && el.textContent.includes('Amenities & Facilities'));
    if (t) t.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const masterDataPath = path.join(OUT_DIR_ARTIFACTS, 'admin-master-data-no-scrollbar.png');
  await page.screenshot({ path: masterDataPath });
  console.log('Saved admin-master-data-no-scrollbar.png');

  // 2. Locations without scrollbar indicator
  await page.goto('http://127.0.0.1:4201/localities', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  const locPath = path.join(OUT_DIR_ARTIFACTS, 'admin-locations-no-scrollbar.png');
  await page.screenshot({ path: locPath });
  console.log('Saved admin-locations-no-scrollbar.png');

  // 3. Settings Clean without Master Data and Staff & Roles tabs
  await page.goto('http://127.0.0.1:4201/settings', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  const settingsPath = path.join(OUT_DIR_ARTIFACTS, 'admin-settings-clean.png');
  await page.screenshot({ path: settingsPath });
  console.log('Saved admin-settings-clean.png');

  // 4. Content & Legal Pages - All Documents (Desktop 1280x850)
  await page.goto('http://127.0.0.1:4201/content', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const contentAllPath = path.join(OUT_DIR_ARTIFACTS, 'admin-content-pages-all-desktop.png');
  await page.screenshot({ path: contentAllPath });
  console.log('Saved admin-content-pages-all-desktop.png');

  // 5. Member Mobile App Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const t = tabs.find(el => el.textContent && el.textContent.includes('Member Mobile App'));
    if (t) t.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const contentMemberPath = path.join(OUT_DIR_ARTIFACTS, 'admin-content-pages-member-app.png');
  await page.screenshot({ path: contentMemberPath });
  console.log('Saved admin-content-pages-member-app.png');

  // 6. Partner Gym Desk Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const t = tabs.find(el => el.textContent && el.textContent.includes('Partner Gym Desk'));
    if (t) t.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const contentPartnerPath = path.join(OUT_DIR_ARTIFACTS, 'admin-content-pages-partner-desk.png');
  await page.screenshot({ path: contentPartnerPath });
  console.log('Saved admin-content-pages-partner-desk.png');

  // 7. Preview Modal for Partner Agreement
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const previewBtn = btns.find(b => b.textContent && b.textContent.includes('Preview'));
    if (previewBtn) previewBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const previewModalPath = path.join(OUT_DIR_ARTIFACTS, 'admin-content-pages-preview-modal.png');
  await page.screenshot({ path: previewModalPath });
  console.log('Saved admin-content-pages-preview-modal.png');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // 8. Editor Modal for New Document
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const newDocBtn = btns.find(b => b.textContent && b.textContent.includes('New Document'));
    if (newDocBtn) newDocBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const editorModalPath = path.join(OUT_DIR_ARTIFACTS, 'admin-content-pages-editor-modal.png');
  await page.screenshot({ path: editorModalPath });
  console.log('Saved admin-content-pages-editor-modal.png');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // 9. Media Tab on Gym Details (View-only, No Add Media button, Cover controls)
  await page.goto('http://127.0.0.1:4201/gyms/gym-1?tab=media', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const mediaViewOnlyPath = path.join(OUT_DIR_ARTIFACTS, 'admin-gym-media-view-only-desktop.png');
  await page.screenshot({ path: mediaViewOnlyPath });
  fs.copyFileSync(mediaViewOnlyPath, path.join(OUT_DIR_ARTIFACTS, 'admin-gym-detail-media-enhanced-desktop.png'));
  fs.copyFileSync(mediaViewOnlyPath, path.join(OUT_DIR_ARTIFACTS, 'admin-gym-detail-media-desktop.png'));
  console.log('Saved admin-gym-media-view-only-desktop.png');

  // 10. Open Enhanced Preview Modal via "Open Slideshow"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const slideBtn = btns.find(b => b.textContent && b.textContent.includes('Open Slideshow'));
    if (slideBtn) slideBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const previewModalPath1 = path.join(OUT_DIR_ARTIFACTS, 'admin-gym-media-enhanced-preview-modal.png');
  await page.screenshot({ path: previewModalPath1 });
  fs.copyFileSync(previewModalPath1, path.join(OUT_DIR_ARTIFACTS, 'admin-gym-detail-media-lightbox.png'));
  console.log('Saved admin-gym-media-enhanced-preview-modal.png');

  // 11. Navigate to Next photo (Photo 2) in the enhanced preview modal
  await page.keyboard.press('ArrowRight');
  await new Promise(r => setTimeout(r, 600));
  const previewModalPath2 = path.join(OUT_DIR_ARTIFACTS, 'admin-gym-media-preview-photo-2.png');
  await page.screenshot({ path: previewModalPath2 });
  console.log('Saved admin-gym-media-preview-photo-2.png');

  // 12. Set Photo 2 as Cover Image from inside preview modal!
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const setCoverBtn = btns.find(b => b.textContent && b.textContent.includes('Set as Cover Image'));
    if (setCoverBtn) setCoverBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const previewModalPath3 = path.join(OUT_DIR_ARTIFACTS, 'admin-gym-media-cover-set-in-modal.png');
  await page.screenshot({ path: previewModalPath3 });
  console.log('Saved admin-gym-media-cover-set-in-modal.png');

  // 13. Close modal with Escape and capture updated gallery grid
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 600));
  const mediaNewCoverPath = path.join(OUT_DIR_ARTIFACTS, 'admin-gym-media-new-cover-grid.png');
  await page.screenshot({ path: mediaNewCoverPath });
  console.log('Saved admin-gym-media-new-cover-grid.png');

  // 14. Scroll down to show gallery cards with Set as Cover / Primary Cover buttons
  await page.evaluate(() => window.scrollBy(0, 420));
  await new Promise(r => setTimeout(r, 600));
  const mediaCardsPath = path.join(OUT_DIR_ARTIFACTS, 'admin-gym-media-cards-grid-scrolled.png');
  await page.screenshot({ path: mediaCardsPath });
  console.log('Saved admin-gym-media-cards-grid-scrolled.png');

  await browser.close();
  server.close();
}

capture().catch(console.error);
