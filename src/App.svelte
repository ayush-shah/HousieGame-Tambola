<script>
  import HousieChart from "./HousieChart.svelte";
  import HousieTicket from "./HousieTicket.svelte";
  import { onMount } from "svelte";
  var socket = io.connect("http://localhost:5000");
  let xasd = 0;
  let data = document.cookie.match("data=")["input"].slice(5);
  socket.emit("reachedHousie", data);
  socket.on("num", data => {
    if (xasd !== 1) {
      xasd = 1;
      document.getElementById("info").style.display = "none";
    }
    num = data.num;
    time = data.time;
    console.log(num, time);
    gaming(data.num, data.time);
  });
  let time = null;
  let num = null;
  function logOut() {
    localStorage.removeItem("arr");
    localStorage.removeItem("arr1");
    document.cookie =
      document.cookie.match("data=") +
      "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.replace("index.html");
  }

  function goLeft() {
    document.getElementById("housieContainer").classList.toggle("goLeft");
    document.getElementsByTagName("main")[0].classList.toggle("makeItSmall");
  }
  let numx = [];
  let counter = 0;
  function gaming(num1, i) {
    let span = document.createElement("span");
    span.classList.add("housie-number");
    if (document.getElementsByClassName("housie-number").length === 1) {
      document.getElementsByClassName("housie-number")[0].remove();
    }
    let housieNumberVar = document.getElementById("housie-number-container");
    span.innerText = num1;
    housieNumberVar.appendChild(span);
    if (i > 91) {
      housieNumberVar.innerText = "Adios, Refreshing in 15 seconds";
      localStorage.removeItem("arr");
      localStorage.removeItem("arr1");
      setTimeout(() => {
        location.replace("./index.html");
      }, 10000);
    }
  }
</script>

<main>
  <nav>
    <ul>
      <li on:click={goLeft}>
        <div id="bringItLeft">Chart</div>
      </li>
      <li on:click={logOut}>
        <div>Logout</div>
      </li>
    </ul>
  </nav>
  <div id="counter">
    <div id="users" />
  </div>
  <div id="housie-number-container">
    <div id="info">
      Room ID :{data}, Tell Your Friends To Join Using This ID.
    </div>
  </div>
  <HousieTicket />
</main>
{#if time !== null && num !== null}
  <HousieChart {num} {time} />
{/if}
