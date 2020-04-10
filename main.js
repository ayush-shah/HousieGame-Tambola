var express = require("express");
var app = express();
var fs = require("fs");
var socket = require("socket.io");
var server = app.listen(5000, () => {
  console.log("listening to :5000");
});

let uniqueID = 1;
let room = {};
let rewards = {
  0: {
    flag: false,
    name: null,
  },
  1: {
    flag: false,
    name: null,
  },
  2: {
    flag: false,
    name: null,
  },
  3: {
    flag: false,
    name: null,
  },
  4: {
    flag: false,
    name: null,
  },
  5: {
    flag: false,
    name: null,
  },
};
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
let arr = [...Array(90).keys()];
app.use(express.static("public"));
var io = socket(server);
let i = 0;
io.on("connection", (socket) => {
  i++;
  io.emit("totalusers", i);
  socket.on("disconnect", () => {
    i--;
    io.emit("totalusers", i);
  });
  socket.on("createRoom", (data) => {
    uniqueID++;
    socket.join("room-" + uniqueID);
    let num = shuffle(arr);
    room[uniqueID] = {
      num: num,
      players: data,
      totalpeople: 0,
      x: 0,
      hasGameStarted: false,
    };
    io.to("room-" + uniqueID).emit("uniqueID", uniqueID);
  });
  socket.on("reachedHousie", (data1) => {
    room[data1].totalpeople += 1;
    socket.join("room-" + data1);
    if (room[data1].totalpeople >= room[data1].players) {
      startGame(data1);
    }
  });
  function startGame(data) {
    if (!room[data].hasGameStarted) {
      room[data].hasGameStarted = true;
      setInterval(() => {
        io.sockets.in("room-" + data).emit("num", {
          num: room[data].num[room[data].x],
          time: room[data].x,
        });
        room[data].x++;
      }, 6500);
    }
  }
  socket.on("joinRoom", (data) => {
    socket.emit("userAdded", data);
  });
});
