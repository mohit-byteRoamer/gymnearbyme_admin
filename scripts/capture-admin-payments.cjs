const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('../apps/gym/node_modules/puppeteer-core');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const DIST_DIR = path.resolve(__dirname, '../apps/admin/dist');
const OUT_DIR_DOCS = path.resolve(__dirname, '../docs/screenshots/admin-payments');
const OUT_DIR_ARTIFACTS = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fa029df2-cd44-42c3-8e9d-7f1afb1cc882';

if (!fs.existsSync(OUT_DIR_DOCS)) {
  fs.mkdirSync(OUT_DIR_DOCS, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startServer(port = 4199) {
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
          res.end('Error loading ' + reqPath);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(port, () => {
      console.log(`Static SPA server running on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function capture() {
  const server = await startServer(4199);
  console.log('Launching browser with:', CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  async function saveScreenshot(name, filename) {
    const docPath = path.join(OUT_DIR_DOCS, filename);
    const artPath = path.join(OUT_DIR_ARTIFACTS, filename);
    await page.screenshot({ path: docPath, fullPage: false });
    fs.copyFileSync(docPath, artPath);
    console.log(`Saved screenshot: ${name} -> ${filename}`);
  }

  try {
    // 1. Payments Tab - Desktop (1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/payments?tab=payments', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Payments Tab (Desktop)', 'admin-payments-payments-desktop.png');

    // 2. Payments Tab - Tablet (1024x768)
    await page.setViewport({ width: 1024, height: 768 });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot('Payments Tab (Tablet)', 'admin-payments-payments-tablet.png');

    // 3. Open Payment Details Drawer (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/payments?tab=payments&drawer=pay_LDH_1001', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Payment Details Drawer', 'admin-payments-drawer-desktop.png');

    // 4. Needs Review Tab - Desktop (1280x850)
    await page.goto('http://127.0.0.1:4199/payments?tab=needs-review', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Needs Review Tab (Desktop)', 'admin-payments-needs-review-desktop.png');

    // 5. Needs Review Tab - Tablet (1024x768)
    await page.setViewport({ width: 1024, height: 768 });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot('Needs Review Tab (Tablet)', 'admin-payments-needs-review-tablet.png');

    // 6. Payouts Tab - Transfers View (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/payments?tab=payouts&view=transfers', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Payouts - Transfers View', 'admin-payments-payouts-transfers-desktop.png');

    // 7. Payouts Tab - By Gym View (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/payments?tab=payouts&view=by-gym', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Payouts - By Gym View', 'admin-payments-payouts-by-gym-desktop.png');

    // 8. Refunds Tab - Desktop (1280x850)
    await page.goto('http://127.0.0.1:4199/payments?tab=refunds', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Refunds Tab', 'admin-payments-refunds-desktop.png');

    // 9. Manual Verification Tab - Desktop (1280x850)
    await page.goto('http://127.0.0.1:4199/payments?tab=manual', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Manual Verification Tab', 'admin-payments-manual-desktop.png');

    // 10. Dedicated Payouts Module - Desktop (1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/payouts', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Dedicated Payouts Module (Desktop)', 'admin-payouts-transfers-desktop.png');

    // 11. Dedicated Payouts Module - Tablet (1024x768)
    await page.setViewport({ width: 1024, height: 768 });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot('Dedicated Payouts Module (Tablet)', 'admin-payouts-transfers-tablet.png');

    // 12. Dedicated Payouts Module - By Gym View (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/payouts?view=by-gym', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Dedicated Payouts Module By Gym (Desktop)', 'admin-payouts-by-gym-desktop.png');

    // 13. Gym Detail Page - Overview & Location with Map (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/gyms/gym-1?tab=overview', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('Gym Detail - Overview & Map (Desktop)', 'admin-gym-detail-overview-desktop.png');

    // 14. Gym Detail Page - Overview (Tablet 1024x768)
    await page.setViewport({ width: 1024, height: 768 });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot('Gym Detail - Overview & Map (Tablet)', 'admin-gym-detail-overview-tablet.png');

    // 15. Gym Detail Page - Plans & Pricing (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/gyms/gym-1?tab=plans', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Gym Detail - Plans & Pricing', 'admin-gym-detail-plans-desktop.png');

    // 16. Gym Detail Page - Media & Photos (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/gyms/gym-1?tab=media', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Gym Detail - Media Gallery', 'admin-gym-detail-media-desktop.png');

    // 17. Gym Detail Page - Members / Users (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/gyms/gym-1?tab=members', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Gym Detail - Members & Users', 'admin-gym-detail-members-desktop.png');

    // 18. Gym Detail Page - Payments Ledger (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/gyms/gym-1?tab=payments', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Gym Detail - Payments Ledger', 'admin-gym-detail-payments-desktop.png');

    // 19. Gym Detail Page - Payouts & Transfers (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/gyms/gym-1?tab=payouts', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Gym Detail - Payouts & Transfers', 'admin-gym-detail-payouts-desktop.png');

    // 20. Notifications Hub - Broadcasts View (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/notifications', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot('Notifications Hub - Broadcasts', 'admin-notifications-broadcasts-desktop.png');

    // 21. Notifications Hub - Tablet (1024x768)
    await page.setViewport({ width: 1024, height: 768 });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot('Notifications Hub (Tablet)', 'admin-notifications-tablet.png');

    // 22. Header Notification Bell Dropdown Open (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    // Click the bell button to open dropdown
    const bellBtn = await page.$('button[aria-label="Notifications"]');
    if (bellBtn) {
      await bellBtn.click();
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot('Header Notifications Dropdown Popover', 'admin-header-notifications-dropdown.png');
    }

    // 23. Master Data Clean Module (Desktop 1280x850)
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://127.0.0.1:4199/master-data', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('Master Data Clean Catalog (Desktop)', 'admin-master-data-clean.png');
    await saveScreenshot('Master Data Clean Catalog (Desktop)', 'admin-master-data-desktop.png');

    // 24. Simple Add Option Modal Open
    const addBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent && el.textContent.includes('Add Amenity'));
      if (b) {
        b.click();
        return true;
      }
      return false;
    });
    if (addBtn) {
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot('Simple Add Option Modal', 'admin-master-data-simple-modal.png');
      // close modal with escape
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }

    // 25. Settings with Master Data Tab Active
    await page.goto('http://127.0.0.1:4199/settings?tab=master-data', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('Settings - Master Data Clean Tab', 'admin-settings-master-data-clean.png');

    // 26. Dedicated Staff Module (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/staff', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('Dedicated Staff Module (Desktop)', 'admin-staff-desktop.png');

    // 27. Add Staff Member Modal
    const addStaffBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent && el.textContent.includes('Add Staff Member'));
      if (b) {
        b.click();
        return true;
      }
      return false;
    });
    if (addStaffBtn) {
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot('Add Staff Member Modal', 'admin-staff-modal.png');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }

    // 28. Dedicated Locations Module (Desktop 1280x850)
    await page.goto('http://127.0.0.1:4199/localities', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('Dedicated Locations Module (Desktop)', 'admin-locations-desktop.png');

    // 29. Add Locality Modal
    const addLocBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent && el.textContent.includes('Add Locality'));
      if (b) {
        b.click();
        return true;
      }
      return false;
    });
    if (addLocBtn) {
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot('Add Locality Modal', 'admin-locations-modal.png');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }

    // 30. Cities Directory Tab
    const citiesTabBtn = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const t = tabs.find(el => el.textContent && el.textContent.includes('Cities Directory'));
      if (t) {
        t.click();
        return true;
      }
      return false;
    });
    if (citiesTabBtn) {
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot('Cities Directory Tab', 'admin-locations-cities-tab.png');
    }

    // 31. Settings Localities Tab with Banner
    await page.goto('http://127.0.0.1:4199/settings?tab=localities', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('Settings - Localities Tab with Banner', 'admin-settings-localities-clean.png');

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

capture();

