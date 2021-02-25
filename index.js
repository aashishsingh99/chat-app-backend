const express = require("express");
const connectDB = require("./config/db");
const app = express();

const cors = require("cors");
const http = require("http");

const socketio = require("socket.io");
connectDB();
const UserSocket = require("./UserSocket.json");
//UserSocket["mang2o"] = "juice";
//console.log(UserSocket, "HELLO ABHISHEK2");
app.use(express.json());
app.use(cors());


// const socketio=require('socket.io')

// Connect Database


// Init middleware
app.use(express.json({ extended: false }));


app.get("/", (req, res) => {
  res.send("working");
});
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketio(server);
//const io = socketio(server);
var current_socket;
// const [dict, setdict] = useState("");

io.on("connection", (socket) => {
  // if(!io.UserSocket)
  // io.UserSocket={}
  //console.log("connecting the user", socket.id);
  //current_socket = socket;
  //console.log("current_socket", current_socket.id);
  current_socket = socket;

  socket.on("join", ({ me, conversation }) => {
    console.log("user logged in")
    console.log(me, socket.id);
    UserSocket[me] = socket;

    console.log("this is usertoken")
    console.log(UserSocket)
    //UserSocket["mang2567o"] = "juice";
    // console.log(UserSocket, "HELLO ABHISHEK2");

    // socket.emit("socket_state", { UserSocket }, (error) => {
    //   if (error) {
    //     alert(error);
    //   }
    // });
    //UserSocket[req.user.name].in(chatRoomId).emit("edit_message", { event:event2 });
    // console.log(UserSocket[me],me);
    // dict[me] = socket;
    // console.log("PRINTING USER SOCKET");
    // console.log(UserSocket);
    if (conversation.length) {
      console.log("sockets!!!!!");

      conversation.map((conversations) => {
        socket.join(conversations._id);
      });
      //console.log(socket);
    }
    
  });

  
  

  socket.on("new_message", ({ text, chatRoomId }) => {
    console.log("new message details");
    console.log(text);
    console.log(chatRoomId);
    socket.to(chatRoomId).emit("emit_message", { text });
  });
  socket.on("typing", ({ chat_typing_id }) => {
    console.log("Typing....");
    socket.to(chat_typing_id).emit("showTyping", ({ chat_typing_id }));
    // socket.manager.sockets.in(chatRoomId).emit("newMessage", { text })
  });
});

app.use(function (req, res, next) {
  req.socket = current_socket;

  next();
});
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/event", require("./routes/messages"));

//io.listen(PORT);
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
