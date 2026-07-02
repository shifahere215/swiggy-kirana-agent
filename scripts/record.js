const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 420, height: 800 },
    headless: 'new'
  });
  
  const page = await browser.newPage();
  
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    videoFrame: { width: 420, height: 800 }
  });
  
  await recorder.start('assets/swiggy_demo.mp4');
  
  try {
    console.log('Navigating to Home...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Nudge action
    console.log('Clicking Add to Cart...');
    await page.click('.btn-add');
    await new Promise(r => setTimeout(r, 1500));

    // Go to Cart
    console.log('Navigating to Cart...');
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Toggle incognito
    console.log('Toggling incognito...');
    await page.click('.slider');
    await new Promise(r => setTimeout(r, 2000));
    
    // Toggle back
    console.log('Toggling back...');
    await page.click('.slider');
    await new Promise(r => setTimeout(r, 2000));

    // Trigger Anomaly
    console.log('Selecting bulk order...');
    await page.select('select', '15'); 
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('Clicking checkout...');
    await page.click('button.btn-add'); // Checkout button
    await new Promise(r => setTimeout(r, 2000)); // wait for bottom sheet animation
    
    console.log('Labeling anomaly...');
    await page.click('.label-btn'); // click the first label
    await new Promise(r => setTimeout(r, 2000));

    console.log('Recording finished successfully.');
  } catch(e) {
    console.error('Error during recording:', e);
  } finally {
    await recorder.stop();
    await browser.close();
  }
})();
