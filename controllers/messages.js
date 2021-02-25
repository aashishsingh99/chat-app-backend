const { validationResult } = require("express-validator");
const User = require("../models/Message");
const { log_and_send_error } = require("./error");
const Event = require("../models/Message");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const UserSocket = require("../UserSocket.json");

exports.getEvents = async (req, res) => {
  console.log("AAAAASHISH");
  const { chatRoomId } = req.body;
  try {
    const events = await Event.find({ chatRoomId: chatRoomId });
    res.json(events);
  } catch (err) {
    log_and_send_error(err.message, 500, "Server Error");
  }
  // try {
  //   if (!timestamp) {
  //     let events = await Event.aggregate([
  //       {
  //         $match: {
  //           chatRoomId: chatRoomId,
  //         },
  //       },

  //       { $sort: { date: 1 } },
  //       {
  //         $group: {
  //           _id: "$messageId",
  //           sender: { $last: "$sender" },
  //           text: { $last: "$text" },
  //           type: { $last: "$type" },
  //           time: { $last: "$date" },
  //         },
  //       },
  //     ]);
  //     console.log(events)

  //     res.status(200).send(events);
  //   } else {
  //     let events = await Event.aggregate([
  //       {
  //         $match: {
  //           date: { $gt: new Date(timestamp) },
  //           chatRoomId: chatRoomId,
  //         },
  //       },

  //       { $sort: { date: 1 } },
  //       {
  //         $group: {
  //           _id: "$messageId",
  //           sender: { $last: "$sender" },
  //           text: { $last: "$text" },
  //           type: { $last: "$type" },
  //           time: { $last: "$date" },
  //         },
  //       },
  //     ]);

  //     res.status(200).send(events);
  //   }
  // } catch (error) {
  //   console.error(error.message);
  //   res.status(500).send("Server error");
  // }
};

// exports.getEvents = async (req, res) => {
//   const { chatRoomId, timestamp } = req.body;
//   // console.log(mongoose.Types.ObjectId.isValid(chatRoomId));]
//   try {
//     if (!timestamp) {
//       let events = await Event.aggregate([
//         {
//           $match: {
//             chatRoomId: new mongoose.Types.ObjectId(chatRoomId),
//           },
//         },

//         { $sort: { date: 1 } },
//         {
//           $group: {
//             _id: "$messageId",
//             sender: { $last: "$sender" },
//             text: { $last: "$text" },
//             type: { $last: "$type" },
//             time: { $last: "$date" },
//           },
//         },
//       ]);
//       console.log(events, "getEnets");

//       res.status(200).send(events);
//     } else {
//       let events = await Event.aggregate([
//         {
//           $match: {
//             date: { $gt: new Date(timestamp) },
//             chatRoomId: new mongoose.Types.ObjectId(chatRoomId),
//           },
//         },

//         { $sort: { date: 1 } },
//         {
//           $group: {
//             _id: "$messageId",
//             sender: { $last: "$sender" },
//             text: { $last: "$text" },
//             type: { $last: "$type" },
//             time: { $last: "$date" },
//           },
//         },
//       ]);
//       console.log(events, "getEnets");

//       res.status(200).send(events);
//     }
//     // socket.emit("new_message", { chatRoomId }, (error) => {
//     //   console.log("emitting new message");
//     //   if (error) {
//     //     alert(error);
//     //   }
//     // });
//   // if (UserToken[user_name] !== undefined) {
//   //     console.log("joining the new user");
//   //     UserToken[user_name].join(newConvo._id);
//   //     req.socket.to(newConvo._id).emit("newConversation", { newConvo });
//   //   }
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server error");
//   }
// };

exports.newEvent = async (req, res) => {
  const { chatRoomId, type, messageId, text } = req.body;
  try {
    let event = new Event({
      sender: req.user.id,
      chatRoomId,
      messageId,
      type,
      text,
    });
    await event.save();
    console.log("i am new event ");
    console.log(req.user.id);
    //let users = await User.findById(req.user.id)
    // console.log(users)
    
    // console.log(req.user.name)
    // console.log(UserSocket[req.user.name])
    console.log("new message");
    UserSocket[req.user.name].in(chatRoomId).emit("new_message", { event });

    res.status(200).send(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.delete = async (req, res) => {
  const { chatRoomId, type, messageId, text } = req.body;
  try {
    let event = new Event({
      sender: req.user.id,
      chatRoomId,
      messageId,
      type,
      text,
    });
    await Event.findOneAndUpdate(
      { messageId, type, chatRoomId },
      {
        text: "This message is deleted",
        type: "DELETE",
      },
      { new: true }
    );
    console.log("new message");
    UserSocket[req.user.name].in(chatRoomId).emit("delete_message", { event });
    res.status(200).send(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.online = async (req, res) => {
  const { chat_id } = req.body;
  try {
    //let users = await User.findById(req.user.id)
    console.log("cchat id",chat_id)
    const curr_chat = await Chat.findById(chat_id).populate("recipients")
    //console.log("name of recipient",curr_chat.recipients[1].name);
    console.log(req.user.id,curr_chat.recipients[1]._id,'online')
   const t=UserSocket[(curr_chat.recipients[1]._id===req.user.id ?curr_chat.recipients[0].name : curr_chat.recipients[1].name)];
    console.log("india");
   let response=false;
    if(t===undefined)
    response=false;
    else
    response=true;
    
    console.log("response",response);
    // console.log("currcchat:",curr_chat);
    // console.log("recipients:",curr_chat.recipients);
    console.log("IN ONLINE CONTROLLER");
    res.status(200).send(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};


exports.edit = async (req, res) => {
  console.log("controller entered");
  const { chatRoomId, type, messageId, text,updatedText } = req.body;
  console.log("before try",chatRoomId,type,messageId,text,updatedText);
  try {
    let event = new Event({
      sender: req.user.id,
      chatRoomId,
      messageId,
      type,
      text,
      
    });
   // console.log("inside try")
    
    console.log("previous text",text);
    console.log("new text",updatedText);
    console.log("in controller",event);
    await Event.findOneAndUpdate(
      { chatRoomId,messageId, type },
      {
       
        type: "EDIT",
        text: updatedText,
      },
      { new: true }
    );
    
      let event2 = new Event({
      sender: req.user.id,
      chatRoomId,
      messageId,
      type:"EDIT",
      text:updatedText,
    });
    console.log("emitted event",event2);
    UserSocket[req.user.name].in(chatRoomId).emit("edit_message", { event:event2 });
    res.status(200).send(event2);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};