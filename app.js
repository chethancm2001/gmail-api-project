//libaries
import { google } from "googleapis";
import dotenv from "dotenv";

import readAllTheMail from "./readAllMain.js";
import getEntriesWithUniqueThreads from "./Unique.js";
import sendReplyToEmail from "./sendMail.js";
import checkAndCrate from "./checkCreate.js";
import addLabel from "./addLabel.js";

//config
dotenv.config();

//constatnts
const redirectURI = "https://developers.google.com/oauthplayground";
const clientID = process.env.clientID;
const clientSecret = process.env.clientSecret;
const refreshToken = process.env.refreshtoken;
const labelName = "TestLabel";
const gmail = auth();

//auth
function auth() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      clientID,
      clientSecret,
      redirectURI
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    console.log("auth success")
    return gmail;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const mainFunction = async () => {
  //read all the mail
  let list = await readAllTheMail(gmail);
  // list all the priori mail
  let uniquelist = getEntriesWithUniqueThreads(list);
  // check and create label
  let labelid = await checkAndCrate(gmail, labelName);

  for (const item of uniquelist) {
    let id = item.id;
    //send reply to mail
    sendReplyToEmail(gmail, id);
    //add label to mail
    addLabel(gmail, id, labelid);
  }
};

function getRandomInterval() {
  return Math.floor(Math.random() * (120000 - 45000) + 45000); // Random time between 45 to 120 seconds
}


function startProcess() {
  mainFunction();
  setInterval(() => {
    mainFunction();
  }, getRandomInterval());
}

startProcess();
