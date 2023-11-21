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

    export default addLabel;