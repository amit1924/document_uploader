Skip to content
DEV Community
Find related posts...
Powered by Algolia
Log in
Create account

37
Jump to Comments

37
Save

Boost

Cover image for Deploy Node API (Express Typescript) on Vercel
Tirth Patel
Tirth Patel
Posted on Nov 16, 2022

81

4

1

1

1
Deploy Node API (Express Typescript) on Vercel

#

typescript

#

express

#

node

#

vercel
Deploy Node API on Vercel (2 Part Series)
1
Deploy Express JS (Node App) on Vercel
2
Deploy Node API (Express Typescript) on Vercel
A couple of weeks back, I developed an API in Node based on Typescript. I tried to deploy it on Heroku.

But the process was long and time-consuming. Also, I noticed that Heroku is terminating free accounts from 28 Nov'22. ☹️

Heroku

So I tried to experiment with various other platforms to deploy my Typescript-based Node API. Amon them free, robust, and versatile platform I found is VERCEL. Based on my experience, here are a few simple steps which you can follow and easily deploy Typescript-based Node API on Vercel. 🚀

1. Express + Typescript Boilerplate App ✏️
   Create express project with typescript. You can follow the below-mentioned steps to make a boilerplate for the project. (Github repo link is provided at end of article)

Initialize node project

npm init -y
Install packages (you can use npm/yarn/pnpm)

yarn add express
yarn add -D typescript
yarn add -D @types/node
yarn add -D @types/express
yarn add -D nodemon
yarn add -D ts-node
Create tsconfig.json
To work with typescript we need to make tsconfig.json file which will help to compile and build Typescript files in plain JS. Execute below command

npx tsc --init --rootDir src --outDir build --esModuleInterop --resolveJsonModule --lib es6 --module commonjs --allowJs true --noImplicitAny true

Once the file is created you can keep it as is, or cleanup non necessary stuff. Replace content of tsconfig.json with following :

    {
    "compilerOptions": {
        "module": "commonjs",
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "target": "es6",
        "noImplicitAny": true,
        "moduleResolution": "node",
        "sourceMap": true,
        "outDir": "dist",
        "baseUrl": ".",
        "paths": {
            "*": ["node_modules/*", "src/types/*"]
        }
    },
    "include": ["./src/**/*"]
    }

Update scripts in package.json

"start": "nodemon src/index.ts",
Write express server code : Create file : src/index.ts and paste following code in it
import express, { Request, Response } from 'express'

const app = express()
const port = process.env.PORT || 8080

app.get('/', (\_req: Request, res: Response) => {
return res.send('Express Typescript on Vercel')
})

app.get('/ping', (\_req: Request, res: Response) => {
return res.send('pong 🏓')
})

app.listen(port, () => {
return console.log(`Server is listening on ${port}`)
})
Spin up server : Run yarn start or npm run start command in terminal to start express serve. You can open browser and go to localhost:8080. API will return response of Express Typescript on Vercel. 2) Initialize git in our project. 📥
Make a .gitignore file in the root of the folder. And add node_modules to it. If .gitignore file exists check that node_modules is added into it.
Execute git init in the terminal (from root of project) or you can use VS Code's source control tab to initialize git repository.
Connect local repo to remote (github/bitbucket). You can use any of the version control system to publish your repository. 3) Create Vercel project 🗃️
Go to vercel.com -> Login
Login using the Version control platform you have kept your repository.
From the dashboard -> Add new project -> Select your repository -> Deploy

Afer deployment you will see something similar to this! 😟

Vercel Error
(ERROR 🚨)

Don't worry... Just follow on steps to fix it. 👍 4) Add Vercel config in app ⚙️
In the above step, after your fist deploy is completed, you can see that we're not getting Express Typescript on Vercel response from API.
To work this as expected, we need to tell Vercel that is a API and you need to serve this as a serverless function.
For this, simply we need to add vercel.json file in root of our project. Paste below code in file.
{
"version": 2,
"builds": [
{
"src": "dist/index.js",
"use": "@vercel/node",
"config": { "includeFiles": ["dist/**"] }
}
],
"routes": [
{
"src": "/(.*)",
"dest": "dist/index.js"
}
]
}

NOTE: Check your tsconfig.json file. The value against outDir must be kept instead of dist. If your config file has any other value than dist, replace it at either of both places.

5. Add a pre-commit hook 🏷️
   Vercel requires plain JS source files instead of Typescript. In order to do this, we need to build the project before committing and send compiled JS files so that Vercel can parse those files and serve the API.

Install pre-commit and rimraf package :

yarn add -D pre-commit
yarn add -D rimraf
Modify scripts field in package.json file as follows:
"scripts": {
"start": "nodemon src/index.ts",
"build": "rimraf dist && tsc",
"ts.check": "tsc --project tsconfig.json",
"add-build": "git add dist",
"test": "echo \"Error: no test specified\" && exit 1"
},
Add new field pre-commit field in package.json :
"pre-commit": [
"ts.check",
"build",
"add-build"
]
What this will do? → Whenever you will commit, the commands written in pre-commit will be executed. It will check Typescript errors, build the project and add build folder to the staged changes. (If you opt for manual build, don't forget to run build command to start build.) 5) Re-Deploy and Re-Check API 🔁
Commit the changes you have made and push the commit to GitHub. Check on vercel for the new deployment. Vercel will automatically trigger a new deployment on every push. Incase it is not started, you can manually start a deployment.

Once new deployment is live, you can copy the deploy URL and run in browser. You will see Express Typescript on Vercel as a API response. Hurrah 😃

API working

To assure that API is working perfectly, you can also hit /ping route which will return pong 🏓 as the response.
Ping Pong response

Closing comments 🙋‍♂️
Thank you for following steps with me. Incase you find any issue in above mentioned steps, please ping in comment.
Also a humble request you to write which topic you want in my next blog. I will include that in my target list. 🎯
Github repo link for this project : Express Typescript Code

Tirth Patel, signing off! 🫡

Deploy Node API on Vercel (2 Part Series)
1
Deploy Express JS (Node App) on Vercel
2
Deploy Node API (Express Typescript) on Vercel
Top comments (37)
Subscribe
pic
Add to the discussion

cel2022_01 profile image
Cel2022
•
Apr 16 '23

It was useful but what I don´t undestand is why do we need to create dist directory?
That directory must be created when commit occurs but only into vercel.

Could you please explain that?
Have you tried to do the same but without the pre-commit dist folder creation?
How do I change the output directory in vercel.json #5081

3
likes
Like

Reply

tirthpatel profile image
Tirth Patel
•
Aug 13 '23

Hi @cel2022_01,
Good question. Actually the way VERCEL works is based on plain Javascript files. It can't directly operate on Typescript code. So inorder to run our Typescript based Express App, firstly we compile TS to JS. That compiled js source files are stored in dist folder. The path for dist folder is given in vercel config. So when any endpoint is hit to the server, VERCEL find the respective route in the dist folder and processes the request accordingly.

Hope this might resolve your query. Please continue the thread if more discussion is needed.
Thanks.

1
like
Like

Reply

thanhtutzaw profile image
ThanHtutZaw
•
Mar 10 '24

We understand that but why can't vercel build and create the dist itself . Why dist need to be in git after git push .

3
likes
Like
Thread

thanhtutzaw profile image
ThanHtutZaw
•
Mar 10 '24

Deploying Nest and nextjs doesn't need to include dist folder in git source code .

1
like
Like
Thread

ristaa profile image
Milos Ristic
•
Jul 22 '24 • Edited on Jul 22

@thanhtutzaw @cel2022_01 @gaborpinter
I am a bit late to this, but:
The exact issue is that @vercel/node package, through builds prop in vercel.json, doesn't include buildCommand from vercel.json, it just serves what's already built.
However, builds and routes commands are deprecated and it's enough to use rewrite (vercel.com/docs/projects/project-c...).
The easiest solution would be to "skip" tsc and serve API directly through api/index.ts
vercel.json will look like:

{
"rewrites": [
{
"source": "/(.*)",
"destination": "/api"
}
]
}

2
likes
Like

Reply

gaborpinter profile image
Gábor Pintér
•
Jun 3 '24

Any update on this question? Why indeed do we need to push compiled code to a "modern" platform?

3
likes
Like

Reply

aliffazmi profile image
Aliff Azmi
•
Apr 11 '23 • Edited on Apr 11

Thanks!

This is very helpful.

For those who's still stuck at 404 error code missing in Vercel. Just remove the ignore built ts files which is in your .gitignore file. In this case remove or comment out the dist directory.

Image description

3
likes
Like

Reply

tirthpatel profile image
Tirth Patel
•
Aug 13 '23

Good catch @aliffazmi. Thank you for pointing it out. 👍

2
likes
Like

Reply

fatemesoleymanian profile image
fatemesoleymanian
•
Jul 22 '23

it helped me a lot! thank you

4
likes
Like

Reply

mannu profile image
Manpreet Singh
•
Jul 22 '23

Welcome to DEV community @fatemesoleymanian

1
like
Like

Reply

soozav profile image
Luis Verteliz
•
Dec 14 '22 • Edited on Dec 14

Hi Tirth, I'v tried to follow your instructions but I can make my app work, I get the following error: "Due to builds existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply."

In my app url I get the following error: "This Serverless Function has crashed".

Would you take a look at my code please?
github.com/SoozaV/sinecta-maps-bac...

Regards!

1
like
Like

Reply

soozav profile image
Luis Verteliz
•
Dec 14 '22

I think I found out the issue looking at my function logs:

Image description

Do you have any idea on how to solve this? I can't find a solution.

Regards.

1
like
Like

Reply

tirthpatel profile image
Tirth Patel
•
Feb 7 '23

Or you can do one more thing, in the vercel project setting page you can override the build command. You can try this one: npm i -g pg && npm run vercel-build

This will first install pg package in your VM on cloud server. Then you can access it while calling API. Please try this as well. And let me know if it works.

Cheers :)

2
likes
Like
Thread

ashcript profile image
As Manjaka Josvah
•
May 23 '23

I've tried it, but it seems like the error persists... Normally it should work, but I don't know why it doesn't... 😭

Like
Thread

ashcript profile image
As Manjaka Josvah
•
May 23 '23

Image description

Like
Thread

ashcript profile image
As Manjaka Josvah
•
May 23 '23

Finally, I've resolved it, not by installing pg globally with npm, but by adding the dialectModule option into my database configuration as below :

export const dbConfig = {
username: process.env.DB_USERNAME,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
host: process.env.DB_HOSTNAME,
port: process.env.DB_PORT,
dialect: 'postgres',
dialectModule: pg, // I've added this.
timezone: 'Etc/GMT+3', // Because process.env.TZ generated an error maybe due to time format
define: {
charset: 'utf8mb4',
collate: 'utf8mb4_general_ci',
},
logging: false,
};

Like
Thread

scherpablo profile image
Pablo Scherpa
•
Feb 3 '24

Hello, I have the same problem, I put the dialectModule: pg in the DB conifg and nothing, still with the error. I have the DB in supabase and in vercel I installed the integration with supabase to see if it would be corrected but it didn't either. I don't know what to do anymore, is there any other alternative? Thank you.

1
like
Like

Reply

tirthpatel profile image
Tirth Patel
•
Feb 7 '23

Hi @soozav It seems there is some issue with pg package. I've found one resource that might help you. Please check this PG package issue

1
like
Like

Reply

shimont profile image
Shimon Tolts
•
Aug 3 '23

This tutorial helped me, thank you

2
likes
Like

Reply

lucasvtiradentes profile image
Lucas Vieira
•
Jan 17 '23

very useful thank you!

2
likes
Like

Reply

pouriarezaeii profile image
Pouria Rezaei
•
Feb 11 '23

Many thanks Tirth. I was stuck for 4 hours. Finally I found your post and Bingo!

1
like
Like

Reply

cakrads profile image
Cakra Danu Sedayu
•
Apr 14 '24

thank you so much, this really helpful..

Is there a way to avoid pushing the dist folder?
So Vercel will build and generate the dist folder for us

3
likes
Like

Reply

mihaiandrei97 profile image
Mihai-Adrian Andrei
•
Sep 10 '24

Hello! Have you found a way?

1
like
Like

Reply

soydiego profile image
Diego Franchina
•
Nov 19 '23

Hi, I hope you can help me.
I follow the tutorial and a lot of tutorials more and I couldn't get the solution.
Always I receive the same error on vercel: 404 not found.

I wrote a post in StackOverflow, maybe someone can reply or if you know what i'm doing wrong, i will appreaciate. This is the post of my question: stackoverflow.com/questions/775091...

Thanks for your time

1
like
Like

Reply

zhouzhonghao profile image
Bobby Zhou
•
Dec 3 '23

Please refer to this question stackoverflow.com/questions/765767....
I posted an anwser there.

Like

Reply

zhouzhonghao profile image
Bobby Zhou
•
Nov 23 '23

You need to share a demo so that another person can help you.

1
like
Like

Reply

soydiego profile image
Diego Franchina
•
Nov 23 '23

Thanks. I didn't share a demo because I wrote my structure and my config file. with exactly all the things.

1
like
Like

Reply

aezamorasanchez profile image
AEZamoraSanchez
•
Jul 16 '24

hello i followed all the steps and uploaded my repository which is connected with sequelize to postgresql but i get this error:
Error: Please install pg package manually
at ConnectionManager.\_loadDialectModule (/var/task/node_modules/sequelize/lib/dialects/abstract/connection-manager.js:55:15)
at new ConnectionManager (/var/task/node_modules/sequelize/lib/dialects/postgres/connection-manager.js:15:24)
at new PostgresDialect (/var/task/node_modules/sequelize/lib/dialects/postgres/index.js:13:30)
at new Sequelize (/var/task/node_modules/sequelize/lib/sequelize.js:194:20)
at Object. (/var/task/dist/db-connection.js:8:14)
at Module.\_compile (node:internal/modules/cjs/loader:1358:14)
at Module.\_extensions..js (node:internal/modules/cjs/loader:1416:10)
at Module.load (node:internal/modules/cjs/loader:1208:32)
at Module.\_load (node:internal/modules/cjs/loader:1024:12)
at /opt/rust/nodejs.js:1:11506
anyone know how to fix it ?

1
like
Like

Reply
View full discussion (37 comments)
Code of Conduct • Report abuse

Tirth Patel
Follow
Location
India
Education
Computer Engineer from PDPU
Work
SDE at Jio | Web & Mobile App Developer | Python, ML, AI Enthusiast
Joined
Apr 5, 2021
More from Tirth Patel
MunchPay Node API - Apply semantic versioning
#node #express #programming #beginners
Deploy Express JS (Node App) on Vercel
#javascript #express #vercel #node
DEV Community — A space to discuss and keep up software development and manage your software career

Home
DEV++
Reading List
Videos
DEV Education Tracks
DEV Challenges
DEV Help
Advertise on DEV
Organization Accounts
DEV Showcase
About
Contact
Free Postgres Database
DEV Shop
MLH
Code of Conduct
Privacy Policy
Terms of Use
Built on Forem — the open source software that powers DEV and other inclusive communities.

Made with love and Ruby on Rails. DEV Community © 2016 - 2026.
