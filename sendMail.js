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

export default sendReplyToEmail;