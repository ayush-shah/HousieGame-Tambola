<script>
  function createTicket() {
    document.getElementsByClassName("housie-ticket-class");
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
    }
    document.getElementsByClassName("housie-ticket-class");
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
    }
    priority();
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
  function priority() {
    let a = document.getElementsByClassName("housie-ticket-class"),
      min = [1, 10, 20, 30, 40, 50, 60, 70, 80],
      max = [9, 19, 29, 39, 49, 59, 69, 79, 89],
      arr = [],
      counted = [0, 9, 18, 27],
      counterArr = [],
      num,
      arr1 = [];
    if (
      window.localStorage["arr"] == undefined ||
      window.localStorage["arr"] == "[]"
    ) {
      for (let k = 0; k < 3; k++) {
        for (let j = 0; j < 5; j++) {
          arr.push(randomNoRepeat(counted, arr, k));
        }
      }
      for (let ad = 0; ad < arr.length; ad++) {
        for (let ak = 0; ak < 9; ak++) {
          if (arr[ad] % 9 == ak) {
            arr1.push(randomNoRepeatv2(min, max, arr1, ak));
            a[arr[ad]].innerHTML = arr1[arr1.length - 1];
          }
        }
      }
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
        // console.log(i);
        arr[i] = asdf;
        arr1[i] = parseInt(a[asdf].innerText);
        i++;
      }
    }
    localStorage.setItem("arr", JSON.stringify(arr));
    localStorage.setItem("arr1", JSON.stringify(arr1));
  }
  function checkHousie(num) {
    let arr = [];
    let arr2 = [];
    let a = document.getElementsByClassName("selectedThis");
    let b = document.getElementsByClassName("addedToList");
    let button = document.getElementsByTagName("button");
    for (let ax = 0; ax < b.length; ax++) {
      arr.push(parseInt(b[ax].innerHTML));
    }
    for (let ax = 0; ax < a.length; ax++) {
      arr2.push(parseInt(a[ax].innerHTML));
    }
    let arr1 = JSON.parse(window.localStorage["arr1"]);
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
          if (counter >= 5) {
            rewards["fastfive"] = 1;
            button[num].disabled = true;
          }
        }
      }
    } else if (num === 1) {
      if (!rewards[1].flag) {
        let counter = 0;
        let four = [0, 4, 10, 14];
        for (let ij = 0; ij < arr2.length; ij++) {
          if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
            counter++;
          }
          if (counter === 4) {
            rewards["fourcorners"] = 1;
            button[num].disabled = true;
          }
        }
      }
    } else if (num === 2) {
      if (!rewards[2].flag) {
        let counter = 0;
        let four = [0, 1, 2, 3, 4];
        for (let ij = 0; ij < arr2.length; ij++) {
          if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
            counter++;
          }
          if (counter === 4) {
            rewards["topline"] = 1;
            button[num].disabled = true;
          }
        }
      }
    } else if (num === 3) {
      if (!rewards[3].flag) {
        let counter = 0;

        let four = [5, 6, 7, 8, 9];
        for (let ij = 0; ij < arr2.length; ij++) {
          if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
            counter++;
          }
          if (counter === 4) {
            rewards["middleline"] = 1;
            button[num].disabled = true;
          }
        }
      }
    } else if (num === 4) {
      if (!rewards[4].flag) {
        let counter = 0;

        let four = [10, 11, 12, 13, 14];
        for (let ij = 0; ij < arr2.length; ij++) {
          if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
            counter++;
          }
          if (counter === 4) {
            rewards["bottomline"] = 1;
            button[num].disabled = true;
          }
        }
      }
    } else if (num === 5) {
      if (!rewards[5].flag) {
        let counter = 0;
        let four = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        for (let ij = 0; ij < arr2.length; ij++) {
          if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
            counter++;
          }
          if (counter === 15) {
            rewards["fullhousie"] = 1;
            button[num].disabled = true;
          }
        }
      }
    }
  }
  function noRepeatfunc(a, b, c, d) {
    for (; !a.includes(b); ) return a.push(b), (c[d].innerText = b), a;
    (b =
      10 * (d % 9) +
      1 +
      Math.floor(Math.random() * (10 * (d % 9) + 10 - 10 * (d % 9)))),
      noRepeatfunc(a, b, c, d);
  }
</script>

<style>

</style>

<main id="housieTicket" on:load={createTicket()} />
<div id="rewards">
  <button on:click={() => checkHousie(0)}>Fast Five</button>
  <button on:click={() => checkHousie(1)}>Four Corners</button>
  <button on:click={() => checkHousie(2)}>Top Line</button>
  <button on:click={() => checkHousie(3)}>Middle Line</button>
  <button on:click={() => checkHousie(4)}>Bottom Line</button>
  <button on:click={() => checkHousie(5)}>Full Housie</button>
</div>
