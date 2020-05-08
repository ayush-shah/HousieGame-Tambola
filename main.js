var express = require("express");
var app = express();
var socket = require("socket.io");
var server = app.listen(5000, () => {
  console.log("listening to :5000");
});
app.use(express.static("public"));
var io = socket(server);
let uniqueID = 0;
let room = [];
function shuffle(array) {
  return array
    .sort(() => Math.random() - 0.5)
    .map((i) => {
      return i + 1;
    });
}
let arr = [...Array(90).keys()];

function createRoom(data) {
  let num = shuffle(arr);
  let arr1 = {
    num: num,
    players: data.no,
    totalpeople: 0,
    x: 0,
    hasGameStarted: false,
    rewards: {
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
    },
  };
  room.splice(uniqueID, 0, arr1);
}
io.on("connection", (socket) => {
  socket.on("createRoom", (data) => {
    socket.join("room-" + uniqueID);
    createRoom(data);
    io.to("room-" + uniqueID).emit("uniqueID", uniqueID);
    uniqueID++;
  });

  socket.on("sendChat", (data) => {
    socket.to("room-" + data.data1).emit("receivedChat", data);
  });
  socket.on("refreshed", (data1) => {
    if (room[data1] !== undefined) {
      socket.join("room-" + data1);
      room[data1].totalpeople += 1;
      checkPlayer(data1);
    } else {
      socket.emit("noRoom");
    }
  });
  socket.on("reachedHousie", (data1) => {
    if (room[data1] !== undefined) {
      room[data1].totalpeople += 1;
      socket.join("room-" + data1);
      let ticket = housieTicket();
      socket.emit("housieTicket", ticket);
      checkPlayer(data1);
    }
  });
  function checkPlayer(data1) {
    if (room[data1].totalpeople >= room[data1].players) {
      startGame(data1);
    } else {
      setTimeout(() => {
        startGame(data1);
      }, 300000);
    }
  }
  socket.on("rewards", (data) => {
    if (room[data.data] !== undefined) {
      room[data.data].rewards = data.rewards;
      io.sockets
        .in("room-" + data.data)
        .emit("checkRewards", room[data.data].rewards);
    }
  });

  socket.on("joinRoom", (data) => {
    if (room[data.id] == undefined) {
      socket.emit("noRoom");
    } else {
      socket.emit("userAdded", data.id);
    }
  });
});

function startGame(data) {
  if (room[data] !== undefined) {
    io.sockets.in("room-" + data).emit("checkRewards", room[data].rewards);
    if (!room[data].hasGameStarted) {
      room[data].hasGameStarted = true;
      let a = setInterval(() => {
        if (room[data].x < 90) {
          io.sockets.in("room-" + data).emit("num", {
            num: room[data].num[room[data].x],
            time: room[data].x,
            data: room[data].num.slice(0, room[data].x),
          });
          room[data].x += 1;
          io.sockets.in("room-" + data).emit("finalrewards", {
            rewards: room[data].rewards,
          });
        } else {
          delete room[data];
          clearInterval(a);
        }
      }, 13000);
    }
  }
}

function randomNoRepeatv2(min, max, arr, k) {
  let num = min[k] + Math.floor(Math.random() * (max[k] - min[k]));
  if (arr.includes(num)) {
    return randomNoRepeatv2(min, max, arr, k);
  }
  return num;
}
function randomNoRepeat(counted, arr, k) {
  let num =
    counted[k] + Math.floor(Math.random() * (counted[k + 1] - counted[k]));
  if (arr.includes(num)) {
    return randomNoRepeat(counted, arr, k);
  }
  return num;
}
function housieTicket() {
  let min = [1, 10, 20, 30, 40, 50, 60, 70, 80],
    max = [9, 19, 29, 39, 49, 59, 69, 79, 89],
    arr = [],
    counted = [0, 9, 18, 27],
    arr1 = [];
  for (let k = 0; k < 3; k++) {
    for (let j = 0; j < 5; j++) {
      arr.push(randomNoRepeat(counted, arr, k));
    }
  }
  for (let ad = 0; ad < arr.length; ad++) {
    for (let ak = 0; ak < 9; ak++) {
      if (arr[ad] % 9 == ak) {
        arr1.push(randomNoRepeatv2(min, max, arr1, ak));
      }
    }
  }
  return { arr: JSON.stringify(arr), arr1: JSON.stringify(arr1) };
}
