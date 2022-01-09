# Instagram Bot
Over the past year, our friend circle on Instagram had a running competition that included trying to be the first commenter on members of our circle's posts. I almost never got first because I'm usually on my computer and not on my phone. I decided to create a bot that would refresh a person's page and if the bot detects a new post, it would comment "first" in around 5 seconds. I never planned on using this bot because it would remove the fun our friend circle had with the competition.

This bot was written with:
 - `puppeteer` - Browser simulation
 - `cron` - Repeated checks for new posts
 - `numeral` - Convert "x posts" to x

## Setup
This tutorial infers that you have a developer environment set up for NodeJS.
 - IDE
 - NodeJS v16.13.1
 - NPM v8.1.2

 First, create a json file called `config.json`. Then, paste the following code replaced with correct details into the file and save.
 ```json
{
    "username": "instagram",
    "password": "notInstagramREALPassword123",
    "posts": 0,
    "userToTrack": "m_phelps00",
    "headless": false,
    "toType": "first"
}

 ```
Please replace the first two fields with the account details of the commenter. Then, replace `userToTrack` with the user you want to comment on first. Headless is used if you want to see the app working. If you don't, change `headless` to `true`. `toType` is what text you want to type.

Then, run
```
npm install
```
to install the required dependencies.

Next, run
```
npm run login
```
This will login and generate the cookie for the website.

Finally, start the bot with
```
npm start
```

Let me know if you have an issues with the issues tab in GitHub.