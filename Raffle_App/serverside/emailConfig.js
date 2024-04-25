// config
// Ideally should be set as evn variables, but had issues accessing them on some devices
// set command: set MAIL_USERNAME = "exampleEmail@gmail.com"
// but to ensure it runs on different setups, put them in here:

MAIL_USERNAME = "exampleEmail@gmail.com";
MAIL_PASSWORD = "examplePassword"
MAIL_RECEPIENT = "";
OAUTH_CLIENTID = "xxx";
OAUTH_CLIENT_SECRET = "xxx";
OAUTH_REFRESH_TOKEN = "xxx";

module.exports = { MAIL_USERNAME, MAIL_PASSWORD,OAUTH_CLIENTID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN};



