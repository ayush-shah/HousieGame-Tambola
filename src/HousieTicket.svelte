<script>
  import { onMount, afterUpdate } from "svelte";
  export let socket;

  let button = document.getElementsByTagName("button");
  let username = window.localStorage["2"];
  let data = window.localStorage["1"];
  let rewards = null;
  let buttonspan = document.getElementsByClassName("buttonspan");

  socket.on("housieTicket", ticket => {
    localStorage.setItem("arr", ticket.arr);
    localStorage.setItem("arr1", ticket.arr1);
    createTicket();
  });
  onMount(() => {
    if (window.localStorage["arr1"] !== undefined) {
      createTicket();
    }
  });
  function createTicket() {
    for (let a = 0; 27 > a; a++) {
      let a = document.getElementById("housieTicket"),
        b = document.createElement("span");
      b.classList.add("notThis");
      b.addEventListener("click", e => {
        if (e.target.innerText != "") {
          e.target.classList.toggle("selectedThis");
          e.target.classList.toggle("notThis");
        }
      });
      b.classList.add("housie-ticket-class"),
        (b.innerText = ""),
        a.appendChild(b);
    }
    if (window.localStorage["arr1"] !== undefined) {
      let arr = JSON.parse(window.localStorage["arr"]);
      let arr1 = JSON.parse(window.localStorage["arr1"]);
      let a = document.getElementsByClassName("housie-ticket-class");
      for (let ad = 0; ad < arr.length; ad++) {
        a[arr[ad]].innerHTML = arr1[ad];
      }
      let f = [0, 9, 18];
      for (let asd = 0; asd < 1; asd++) {
        for (let kl = 0; kl < 9; kl++) {
          {
            if (
              a[f[asd] + kl].innerHTML !== "" &&
              a[f[asd + 1] + kl].innerHTML !== ""
            ) {
              if (a[f[asd] + kl].innerHTML > a[f[asd + 1] + kl].innerHTML) {
                let temp = a[f[asd] + kl].innerHTML;
                a[f[asd] + kl].innerHTML = a[f[asd + 1] + kl].innerHTML;
                a[f[asd + 1] + kl].innerHTML = temp;
              }
            }
            if (
              a[f[asd] + kl].innerHTML !== "" &&
              a[f[asd + 2] + kl].innerHTML !== ""
            ) {
              if (a[f[asd] + kl].innerHTML > a[f[asd + 2] + kl].innerHTML) {
                let temp = a[f[asd] + kl].innerHTML;
                a[f[asd] + kl].innerHTML = a[f[asd + 2] + kl].innerHTML;
                a[f[asd + 2] + kl].innerHTML = temp;
              }
            }
          }
          if (
            a[f[asd + 1] + kl].innerHTML !== "" &&
            a[f[asd + 2] + kl].innerHTML !== ""
          ) {
            if (a[f[asd + 1] + kl].innerHTML > a[f[asd + 2] + kl].innerHTML) {
              let temp = a[f[asd + 1] + kl].innerHTML;
              a[f[asd + 1] + kl].innerHTML = a[f[asd + 2] + kl].innerHTML;
              a[f[asd + 2] + kl].innerHTML = temp;
            }
          }
        }
      }
      let i = 0;
      for (let asdf = 0; asdf < 27; asdf++) {
        if (a[asdf].innerText !== "") {
          arr[i] = asdf;
          arr1[i] = parseInt(a[asdf].innerText);
          i++;
          a[asdf].classList.add("notEmpty");
        }
      }
    } else {
      alert("Some Error Occured, Logout and Login Once again");
    }
  }

  function checkHousie(num, rewards) {
    let arr = [];
    let arr2 = [];
    let a = document.getElementsByClassName("selectedThis");
    let b = document.getElementsByClassName("addedToList");
    let housieNotEmpty = document.getElementsByClassName("notEmpty");
    //numbers completed
    for (let ax = 0; ax < b.length; ax++) {
      arr.push(parseInt(b[ax].innerHTML));
    }
    //numbers selected
    for (let ax = 0; ax < a.length; ax++) {
      arr2.push(parseInt(a[ax].innerHTML));
    }
    //housie ticket numbers
    let arr1 = JSON.parse(window.localStorage["arr1"]);
    //housie ticket positions
    let arrx = JSON.parse(window.localStorage["arr"]);
    if (num === 0) {
      if (!rewards[0].flag) {
        if (arr2.length >= 5) {
          let counter = 0;
          arr2.forEach(a => {
            if (arr.includes(a)) {
              counter++;
            }
          });
          if (counter === 5) {
            rewards[0].flag = true;
            rewards[0].name = username;
            socket.emit("rewards", { data: data, rewards: rewards });
            button[num].disabled = true;
          }
        }
      }
    } else if (num === 1) {
      if (!rewards[1].flag) {
        let counter = 0;
        for (let ij = 0; ij < arr2.length; ij++) {
          {
            for (let fourindex = 0; fourindex < 4; fourindex++)
              if (
                parseInt(housieNotEmpty[four[fourindex]].innerHTML) ===
                  arr2[ij] &&
                arr.includes(arr2[ij])
              ) {
                counter++;
              }
          }
        }
        if (counter === 4) {
          rewards[1].flag = true;
          rewards[1].name = username;
          socket.emit("rewards", { data: data, rewards: rewards });
          button[num].disabled = true;
        }
      }
    } else if (num === 2) {
      let counter = 0;
      if (!rewards[2].flag) {
        for (let i = 0; i < 5; i++) {
          for (let ij = 0; ij < arr2.length; ij++) {
            if (
              arr.includes(arr2[ij]) &&
              parseInt(housieNotEmpty[top[i]].innerHTML) === arr2[ij]
            ) {
              counter++;
            }
          }
        }
        if (counter === 5) {
          rewards[2].flag = true;
          rewards[2].name = username;
          socket.emit("rewards", { data: data, rewards: rewards });
          button[num].disabled = true;
        }
      }
    } else if (num === 3) {
      let counter = 0;
      if (!rewards[3].flag) {
        for (let i = 0; i < 5; i++) {
          for (let ij = 0; ij < arr2.length; ij++) {
            if (
              arr.includes(arr2[ij]) &&
              parseInt(housieNotEmpty[mid[i]].innerHTML) === arr2[ij]
            ) {
              counter++;
            }
          }
        }
        if (counter === 5) {
          rewards[3].flag = true;
          rewards[3].name = username;
          socket.emit("rewards", { data: data, rewards: rewards });
          button[num].disabled = true;
        }
      }
    } else if (num === 4) {
      let counter = 0;
      if (!rewards[4].flag) {
        for (let i = 0; i < 5; i++) {
          for (let ij = 0; ij < arr2.length; ij++) {
            if (
              arr.includes(arr2[ij]) &&
              parseInt(housieNotEmpty[bot[i]].innerHTML) === arr2[ij]
            ) {
              counter++;
            }
          }
        }
        if (counter === 5) {
          rewards[4].flag = true;
          rewards[4].name = username;
          socket.emit("rewards", { data: data, rewards: rewards });
          button[num].disabled = true;
        }
      }
    } else if (num === 5) {
      let counter = 0;
      if (!rewards[5].flag) {
        for (let i = 0; i < 5; i++) {
          for (let ij = 0; ij < arr2.length; ij++) {
            if (
              arr.includes(arr2[ij]) &&
              parseInt(housieNotEmpty[full[i]].innerHTML) === arr2[ij]
            ) {
              counter++;
            }
          }
        }
        if (counter === 15) {
          rewards[5].flag = true;
          rewards[5].name = username;
          socket.emit("rewards", { data: data, rewards: rewards });
          button[num].disabled = true;
        }
      }
    }
  }

  let four = [0, 4, 10, 14];
  let top = [0, 1, 2, 3, 4];
  let mid = [5, 6, 7, 8, 9];
  let bot = [10, 11, 12, 13, 14];
  let full = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  socket.on("checkRewards", rewardsa => {
    rewards = rewardsa;
    if (button[0].innerHTML === "Copy Link") {
      button[0].remove();
    }
    for (let i = 0; i < 6; i++) {
      if (rewardsa[i].flag && button[i].disabled == false) {
        button[i].disabled = true;
        alert(rewardsa[i].name + " won " + button[i].innerText);
        if (buttonspan[i].innerText !== rewardsa[i].name) {
          buttonspan[i].innerText = rewardsa[i].name;
        }
      }
    }
  });
</script>

<main id="housieTicket" />
<div id="rewards">
  <button on:click={() => checkHousie(0, rewards)}>
    Fast Five
    <span class="buttonspan" />
  </button>
  <button on:click={() => checkHousie(1, rewards)}>
    Four Corners
    <span class="buttonspan" />
  </button>
  <button on:click={() => checkHousie(2, rewards)}>
    Top Line
    <span class="buttonspan" />
  </button>
  <button on:click={() => checkHousie(3, rewards)}>
    Middle Line
    <span class="buttonspan" />
  </button>
  <button on:click={() => checkHousie(4, rewards)}>
    Bottom Line
    <span class="buttonspan" />
  </button>
  <button on:click={() => checkHousie(5, rewards)}>
    Full Housie
    <span class="buttonspan" />
  </button>
</div>
