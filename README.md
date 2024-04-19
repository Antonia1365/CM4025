# CM4025

Project requirements:
Packages with the minimal version required are listed in package.json, exclusing Node.js
Project was madee and served locally on a windows machine.
--------------------------------------------------------------------------------------------

Step 1: Database setup
Requires instalation of mongodb locally via https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/
If the global variable is set up, can just run the db_setup.bat script to set up the database with some instances or
cd into the bin directory of the version isntalled (cd "C:\Program Files\MongoDB\Server\<version>\bin"), type "mongo" (or "mongosh" depending on the version) and copy the contents from the file into the mongo shell.
Once the database is setup, to serve the project, run the server.js file locally, from the serverside directory via "node server.js". 
The port setup is 8080.

Email sending with nodemailer:
I made an email for the project, to send out emails from, as the means to notify winners of draws. Was setup following this guide: https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/ and can generate keys for another email address, if needed. 
