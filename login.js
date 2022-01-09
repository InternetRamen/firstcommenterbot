const puppeteer = require("puppeteer");
const fs = require("fs");
if (!fs.existsSync("./config.json"))
    throw "Please read the README for setup information.";
const config = require("./config.json");
const CronJob = require("cron").CronJob;
const numeral = require("numeral");

(async () => {
    const browser = await puppeteer.launch({ headless: config.headless });
    const page = await browser.newPage();
    await page.goto("https://www.instagram.com/", { waitUntil: "load" });
    await page.waitForSelector('input[name="username"]');
    const usernameInput = await page.$('input[name="username"]');
    const passwordInput = await page.$('input[name="password"]');
    await usernameInput.type(config.username, { delay: 100 });
    await passwordInput.type(config.password, { delay: 100 });

    let elements = await page.$$("button");
    if (elements.length == 0) throw "no button not found";
    elements = await Promise.all(
        elements.map(async (val) => {
            return {
                element: val,
                content: await page.evaluate((el) => el.textContent, val),
            };
        })
    );

    let login = elements.filter(
        (val) => val.content.toLowerCase().trim() === "log in"
    );
    if (login.length == 0) throw "login button not found";
    login = login[0];
    await login.element.click();
    await page.waitForTimeout(10000);
    await page.screenshot({ path: "loggedin.png" });
    const cookies = await page.cookies();
    await fs.writeFileSync("./cookies.json", JSON.stringify(cookies));
    await browser.close();
})();
