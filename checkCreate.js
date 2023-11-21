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

    export default checkAndCrate;