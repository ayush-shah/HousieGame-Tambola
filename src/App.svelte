<script>
  import HousieChart from "./HousieChart.svelte";
  import HousieTicket from "./HousieTicket.svelte";
  import { onMount } from "svelte";
  onMount(async () => {
    const resp = await fetch(`./Data.json`);
    const e = await resp.json().then(e => e);
    time = e[document.cookie.match(/[0-9]{10}/).splice(0, 10)].time;
    num = e[document.cookie.match(/[0-9]{10}/).splice(0, 10)].num;
    console.log(time);
    housieNumber(num, time);
  });
  let time = null;
  let num = null;
  function logOut() {
    localStorage.removeItem("arr");
    localStorage.removeItem("arr1");
    document.cookie =
      document.cookie.match(/[0-9]{10}/) +
      "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.replace("index.html");
  }

  function housieNumber(num, time) {
    let date = new Date();
    time = Math.trunc(
      Math.abs((date.getMinutes() * 60 + date.getSeconds() - time) / 6.5
    ));
    console.log(time*6.5);

    setTimeout(() => {
      gaming(num, time);
    }, 10000);
  }
  function goLeft() {
    document.getElementById("housieContainer").classList.toggle("goLeft");
    document.getElementsByTagName("main")[0].classList.toggle("makeItSmall");
  }
  let counter = 0;
  function gaming(num, i) {
    let span = document.createElement("span");
    span.classList.add("housie-number");
    if (document.getElementsByClassName("housie-number").length === 1) {
      document.getElementsByClassName("housie-number")[0].remove();
    }
    let housieNumberVar = document.getElementById("housie-number-container");
    let span1 = document.createElement("span");
    let old = document.getElementsByClassName("housie-number-old");
    if (old.length === 4) {
      old[0].remove();
    }
    if (num[i - 1] == undefined) {
    } else {
      span1.innerText = num[i - 1];
      span1.classList.add("housie-number-old");
      housieNumberVar.appendChild(span1);
    }
    if (num[i] == undefined) {
    } else {
      span.innerText = num[i];
      housieNumberVar.appendChild(span);
    }
    if (span) i++;
    if (i > 91) {
      housieNumberVar.innerText = "Adios, Refreshing in 15 seconds";
      for (var j = old.length - 1; j >= 0; --j) {
        old[j].remove();
      }
      localStorage.removeItem("arr");
      localStorage.removeItem("arr1");
      document.cookie = "1=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setTimeout(() => {
        location.replace("./index.html");
      }, 10000);
    } else {
      setTimeout(() => {
        gaming(num,i);
      }, 6500);
    }
  }
  let seconds = 9;
  let xid = setInterval(() => {
    seconds -= 1;
    if (seconds === 0) {
      document.getElementById("timeout").style.display = "none";
      return clearInterval(xid);
    }
  }, 1000);
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
  <p id="timeout">The game will start in {seconds}</p>
  <div id="housie-number-container" />
  <HousieTicket />
</main>
{#if time !== null && num !== null}
  <HousieChart {num} {time} />
{/if}
