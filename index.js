const puppeteer = require("puppeteer");
const fs = require("fs");

const CronJob = require("cron").CronJob;

const numeral = require("numeral");

(async () => {
    if (!fs.existsSync("./config.json"))
        throw "Please read the README for setup information.";
    const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

    const website = `https://www.instagram.com/${config.userToTrack}/`;
    const browser = await puppeteer.launch({ headless: config.headless });
    const page = await browser.newPage();
    let foundPost = false;
    page.on("console", (msg) => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`);
    });

    await page.goto(website, {
        waitUntil: "load",
    });
    if (!fs.existsSync("./cookies.json")) throw "Please login first.";
    const cookiesString = await fs.readFileSync("./cookies.json");
    if (!cookiesString) throw "Please login first.";
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    await page.goto(website, {
        waitUntil: "load",
    });

    await page.waitForSelector('a[href^="/p/"]');
    await page.screenshot({ path: "userpage.png" });

    const job = new CronJob(
        "*/5 * * * * *",
        async function () {
            console.log("Reloading page...");
            if (foundPost) return;
            await page.reload();
            let data = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
            let currentPosts = data.posts;
            let stats = await page.$$("li span");
            stats = await Promise.all(
                stats.map(async (val) => {
                    return {
                        stat: val,
                        content: await page.evaluate(
                            (el) => el.textContent,
                            val
                        ),
                    };
                })
            );
            let posts = stats.filter((val) =>
                val.content.toLowerCase().trim().includes("posts")
            );
            posts = posts[0];

            posts = numeral(posts.content).value();
            console.log(`Posts rn: ${posts}\nPosts in cached: ${currentPosts}`);
            if (currentPosts - posts == 1) {
                let listOfPosts = await page.$$('a[href^="/p/"]');
                listOfPosts = await Promise.all(
                    listOfPosts.map(async (val) => {
                        return {
                            post: val,
                            content: await page.evaluate(
                                (el) => el.textContent,
                                val
                            ),
                        };
                    })
                );
                await listOfPosts[0].post.click();
                foundPost = true;
                await page.waitForSelector(
                    'textarea[aria-label="Add a comment…"]'
                );
                let textarea = await page.$(
                    'textarea[aria-label="Add a comment…"]'
                );
                if (!textarea) throw "Could not find comment box.";
                await textarea.type(config.toType, { delay: 100 });
                let submit = await page.$('button[type="submit"]');
                if (!submit) throw "Could not find submit box.";
                await submit.click();
                await page.screenshot({ path: "post.png" });
                await page.waitForTimeout(2000);
                await page.goto(website);
                foundPost = false;
                console.log("Commented");
                data.posts += 1;
                fs.writeFileSync("./config.json", JSON.stringify(data));
            } else if (posts > currentPosts) {
                data.posts = posts;
                fs.writeFileSync("./config.json", JSON.stringify(data));
                console.log("Posts in database less than what found");
            }
        },
        null,
        true,
        "America/Los_Angeles"
    );
    await job.start();
})();
