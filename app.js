//libaries
import { google } from "googleapis";
import dotenv from "dotenv";

//config
dotenv.config();

//constatnts
const redirectURI = "https://developers.google.com/oauthplayground";
const clientID = process.env.clientID;
const clientSecret = process.env.clientSecret;
const refreshToken = process.env.refreshtoken;
const labelName = "TestLabel";

//main function
const mainFunction = async () => {
  // autheticate the client
  const oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    redirectURI
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

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
    addLabel(gmail,id, labelid);
  }
};

mainFunction();

async function readAllTheMail(gmail) {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const listofId = response.data.messages;

    return listofId;
  } catch (error) {
    return null;
  }
}

function getEntriesWithUniqueThreads(data) {
    
//[ { id: '18bf2a1e76a9830a', threadId: '18bf2a1e76a9830a' } ]
  const threadIdCount = new Map();
  const uniqueData = [];

  for (const item of data) {
    const { id, threadId } = item;
    const count = threadIdCount.get(threadId) || 0;
    threadIdCount.set(threadId, count + 1);
  }

  for (const item of data) {
    const { id, threadId } = item;
    if (threadIdCount.get(threadId) === 1) {
      uniqueData.push(item);
    }
  }

  return uniqueData;
}

//readAllTheMail();

async function sendReplyToEmail(gmail, messageId) {
  try {
    const message = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });

    const headers = message.data.payload.headers;
    let fromEmail, subject, toEmail;
    for (const header of headers) {
      if (header.name === "From") {
        fromEmail = header.value;
      } else if (header.name === "To") {
        toEmail = header.value;
      } else if (header.name === "Subject") {
        subject = header.value;
      }
    }

    const emailLines = [
      `To: ${fromEmail}`,
      `From:${toEmail}`,
      `Subject: Re: ${subject}`,

      "",
      "Your reply message goes here.",
    ];

    const email = emailLines.join("\r\n").trim();

    const encodedMessage = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: message.data.threadId,
      },
    });

    console.log("Reply sent:", res.data);
    return messageId;
  } catch (error) {
    console.error("Error replying to email:", error);
  }
}

const checkAndCrate = async (gmail, labelName) => {
  try {
    const response = await gmail.users.labels.list({ userId: "me" });
    const labels = response.data.labels;

    let labelList = [];
    let labelid = "";
    for (const label of labels) {
      if (label.name === labelName) {
        labelid = label.id;
        return labelid;
      }
      labelList.push(label.name);
    }

    if (labelList.includes(labelName)) {
      console.log("label already exists");
    } else {
      const res = await gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });
      console.log("label created");
      return res.data.id;
    }
  } catch (error) {
    console.error("Error listing:", error);
    return null;
  }
};

const addLabel = async (gmail, id, labelName) => {
  try {
    let res = await gmail.users.messages.modify({
      userId: "me",
      id: id,
      requestBody: {
        addLabelIds: [labelName],
        removeLabelIds: [], // Ensure an empty removeLabelIds array
      },
    });
    if (res.status === 200) {
      console.log("label added");
    }
  } catch (error) {
    console.log(error);
  }
};
