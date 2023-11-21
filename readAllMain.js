async function readAllTheMail(gmail) {
    try {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
      });
  
      const listofId = response.data.messages;
      console.log("read success")
      return listofId;
    } catch (error) {
      return null;
    }
  }

  export default readAllTheMail;