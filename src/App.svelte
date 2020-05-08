<script>
  import HousieChart from "./HousieChart.svelte";
  import HousieTicket from "./HousieTicket.svelte";
  import { onMount } from "svelte";
  var socket = io.connect("http://localhost:5000");
  let xasd = 0;
  let nameCookie = window.localStorage["2"];
  let data = window.localStorage["1"];
  let housienum = null;

  function copyFunction() {
    let copybtn = document.getElementById("copybtn");
    let copyText = document.getElementsByClassName("link")[0];
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    copybtn.innerText = "Copied";
  }
  if (window.location.href.indexOf("?") !== -1) {
    if (nameCookie === undefined) {
      data = window.location.href.split("?")[1];
      nameCookie = prompt("Enter Your Name");
      localStorage.setItem("2", nameCookie);
      localStorage.setItem("1", data);
      socket.emit("joinRoom", { id: data });
      socket.on("noRoom", () => {
        alert("No Room with that id");
        location.replace("index.html");
      });
    }
  } else {
    if (data === undefined) {
      alert("Submit the data first");
      location.replace("index.html");
    }
  }

  function chat(e) {
    e.preventDefault();
    let text = document.getElementById("text");
    let chatText = document.createElement("div");
    let dataText = document.createElement("div");
    chatText.classList.add("mychats");
    dataText.classList.add("mydata");
    dataText.innerText = text.value;
    chatText.appendChild(dataText);
    document.getElementById("chats").appendChild(chatText);
    socket.emit("sendChat", {
      name: nameCookie,
      data: text.value,
      data1: data
    });
    document.getElementById("chats").scrollTop = document.getElementById(
      "chats"
    ).scrollHeight;
    e.target.children[0].value = "";
  }
  let chatNumber = 0;
  socket.on("receivedChat", data => {
    let chatText = document.createElement("div");
    let nameText = document.createElement("div");
    let dataText = document.createElement("div");
    chatText.classList.add("chats");
    nameText.classList.add("name");
    dataText.classList.add("data");
    nameText.innerText = data.name;
    dataText.innerText = data.data;
    chatText.appendChild(nameText);
    chatText.appendChild(dataText);
    if (!document.getElementById("mainChat").classList.contains("makeitBig")) {
      chatNumber += 1;
    }
    document.getElementById("chats").appendChild(chatText);
    document.getElementById("chats").scrollTop = document.getElementById(
      "chats"
    ).scrollHeight;
  });
  if (data && window.localStorage["arr1"] === undefined) {
    socket.emit("reachedHousie", data);
  } else {
    socket.emit("refreshed", data);
  }
  socket.on("num", data => {
    if (xasd !== 1) {
      xasd = 1;
      document.getElementById("info").remove();
    }
    num = data.num;
    time = data.time;
    arr = data.data;
    gaming(data.num, data.time);
  });
  function chats() {
    if (!document.getElementById("mainChat").classList.contains("makeitBig")) {
      chatNumber = 0;
    }
    document.getElementById("mainChat").classList.toggle("makeitBig");
  }
  let arr = null;
  let time = null;
  let num = null;
  function logOut() {
    socket.emit("logout", data);
    localStorage.removeItem("arr");
    localStorage.removeItem("arr1");
    localStorage.removeItem("1");
    localStorage.removeItem("2");
    location.replace("index.html");
  }
  socket.on("noRoom", () => {
    alert("No Room with that id");
    location.replace("index.html");
  });
  function goLeft() {
    document.getElementsByTagName("main")[0].classList.toggle("makeItSmall");
  }
  let numx = [];
  let counter = 0;
  var x = document.createElement("AUDIO");
  let doneNumbers = [];
  let span = null;
  function gaming(num1, i) {
    span = num1;
    doneNumbers = [...doneNumbers, num1];
    if (doneNumbers.length > 4) {
      doneNumbers.splice(0, 1);
    }
    playRingtone();
    if (i >= 89) {
      let button123 = document.getElementsByTagName("button");
      for (let ijkl = 0; ijkl < button123.length; ijkl++) {
        button123[ijkl].disabled = true;
      }
      let housieNumberVar = document.getElementById("housie-number-container");
      housieNumberVar.innerText = "Adios, Refreshing in 15 seconds";
      localStorage.removeItem("arr");
      localStorage.removeItem("arr1");
      localStorage.removeItem("1");
      localStorage.removeItem("2");
      setTimeout(() => {
        setTimeout(() => {
          location.replace("./index.html");
        }, 6500);
      }, 10000);
    }
  }
  function closeChats() {
    document.getElementById("mainChat").classList.toggle("makeitBig");
  }
  let asdfgh = 1;
  function playRingtone() {
    if (asdfgh === 4) {
      asdfgh = 1;
    }
    x.setAttribute("src", `Ringtones/${asdfgh}.mp3`);
    x.play();
    asdfgh++;
  }
</script>

<main class="makeItSmall">
  <nav>
    <ul>
      <li on:click={chats}>
        Chats
        {#if chatNumber > 0}
          <span class="chatNumber">{chatNumber}</span>
        {/if}
      </li>
      <li on:click={goLeft}>Housie Chart</li>
      <li on:click={logOut}>Logout</li>
    </ul>
  </nav>
  <div id="housie-number-container">
    <div id="info">
      Room ID :{data}, Join Using This ID or copy the link and share it with
      your friends.
      <input
        type="text"
        value="http://localhost:5000/housie.html?{data}"
        class="link" />
      <button id="copybtn" on:click={copyFunction}>Copy Link</button>
    </div>
    {#if span !== null}
      <div class="done">
        {#each [...doneNumbers] as done, i}
          {#if i !== doneNumbers.length - 1}
            <span class="housie-number-over">{done}</span>
          {/if}
        {/each}
      </div>
      <span class="housie-number">{span}</span>
    {/if}

  </div>
  {#if socket !== null}
    <HousieTicket {socket} />
  {/if}
</main>
{#if time !== null && num !== null && arr !== null}
  <HousieChart {num} {time} {arr} />
{/if}

<div id="mainChat">
  <div id="chats" />
  <i class="close" on:click={closeChats}>&#10005;</i>
  <form
    action=""
    id="chatform"
    method="POST"
    on:submit={chat}
    autocomplete="off">
    <input type="text" id="text" placeholder="Chat Here" />
    <input type="submit" id="chatSubmit" value="&#10148;" />
  </form>
</div>
