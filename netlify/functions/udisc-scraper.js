import puppeteer from 'puppeteer';

export const handler = async (event, context) => {
  const players = JSON.parse(event.body);

  let browser = null;
  console.log('spawning chrome headless');
  try {
    browser = await puppeteer.launch();
    console.log('launched');

    // Create a page
    const page = await browser.newPage();

    // Go to your site
    await page.goto('https://udisclive.com/standings?d=MPO');
    console.log('page loaded');

    console.log('time out starts');
    await page.waitForTimeout(2000);
    console.log('time out finished');

    // Query for an element handle.
    const mainContent = await page.waitForSelector('#main-content');
    console.log('main content found');

    const mainTable = await mainContent.waitForSelector('.markdown + div');
    console.log('main table found');

    for (const lineItem of await mainTable.$$(
      'div[style*="width: 260px"] > div'
    )) {
      const itemHtml = await page.evaluate(el => el.innerHTML, lineItem);
      players.forEach(player => {
        if (itemHtml.includes(player.name)) {
          const splits = itemHtml.split(/<\/?div[^>]*>/);
          const index = splits.length - 2;
          player.points = !isNaN(splits[index]) ? +splits[index] : 0;
          console.log(player);
        }
      });
      // await lineItem.dispose();
    }
    // await mainTable.dispose();
    await mainContent.dispose();

    // Close browser.
    await browser.close();
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error
      })
    };
  } finally {
    // close browser
    if (browser !== null) {
      await browser.close();
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: players
    })
  };
};
