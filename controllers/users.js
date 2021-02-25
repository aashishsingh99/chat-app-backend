const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const Conversation = require("../models/Chat");
const { log_and_send_error } = require("./error");
const config = require("config");
const UserSocket = require("../UserSocket.json");

// console.log(UserSocket, "HELLO ABHISHEK");
// UserSocket["mango"] = "juice";
// console.log(UserSocket, "HELLO ABHISHEK1");

const { user_by_token } = require("./auth");
exports.user_register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    log_and_send_error(err.message, 500, "Server Error");
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { user_name } = req.body;
    let conversations = await Conversation.find({
      recipients: { $elemMatch: { $eq: req.user.id } },
    }).populate("recipients");

    res.status(200).send(conversations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.newConversation = async (req, res) => {
  //console.log("inside route add conversation");
  //user_name:recipients
  //me:mera user
  const { user_name } = req.body;
  //console.log(user_name);
  try {
    let otherUser = await User.findOne({ name: user_name }).select("-password");

    if (!otherUser) {
      res.status(404).send("This user does not exist");
    }
    //console.log(otherUser);
    let oldConvo = await Conversation.findOne({
      recipients: [req.user.id, otherUser.id],
    }).populate("recipients");

    if (oldConvo) {
      //console.log("inside route add conversation hello");
      res.status(200).send(oldConvo);
    } else {
      //console.log("inside route add conversation old");
      let newConvo = new Conversation({
        recipients: [req.user.id, otherUser.id],
      });
      //console.log("inside route add conversation2");
      await newConvo.save();
      newConvo = await Conversation.findOne({
        recipients: [req.user.id, otherUser.id],
      }).populate("recipients");
      //const user = User.findById(req.user.id);
      //console.log(req.socket.id, "my socket");
      // console.log(req.user.name, "my name");
      // console.log(user_name, "recipient");

      //prev one
      // console.log(UserSocket[user.name].id, "@@@@@@@");
      // await UserSocket[user.name].join(newConvo._id);

      // console.log(UserSocket[user.name].id, "my id ");
      // console.log(UserSocket[user_name], "OP");

      // if (UserSocket[user_name] !== undefined) {
      //   console.log(UserSocket[user_name], user_name, "s socket");
      //   await UserSocket[user_name].join(newConvo._id);
      //   console.log("emitiing addConversation", newConvo._id);
      //   await UserSocket[user.name]
      //     .in(newConvo._id)
      //     .emit("newConversation", { newConvo });
      // }
      // await res.status(200).send(newConvo);

      //new one using req
    
    console.log("Usersocket details")
    console.log
    console.log(req.socket.id,'test1')
     
    await req.socket.join(newConvo._id);
      
      
      if (UserSocket[user_name] !== undefined) {
        await UserSocket[user_name].join(newConvo._id);
        await req.socket.in(newConvo._id).emit("newConversation", { newConvo });
      }
      
      
      await res.status(200).send(newConvo);



    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.getChatById = async (req, res) => {
  const { chatid } = req.body;

  try {
    const chat = await Conversation.findById(chatid).populate("recipients");

    res  .send(chat);
  } catch (err) {
    console.log("Server Error" + err);
  }
};
