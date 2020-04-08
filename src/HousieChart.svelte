<script>
  import { afterUpdate } from "svelte";
  export let num, time;
  afterUpdate(() => {

    housieChart(num, time);
  });
  function housieChart(data, time) {
    let x = 1;
    let housieChart = document.getElementById("housie-chart");
    for (x; x < 91; x++) {
      let span = document.createElement("span");
      span.classList.add("housie-chart-class");
      span.innerText = x;
      housieChart.appendChild(span);
    }
    addToList(data, time);
  }
  function addToList(data, time) {
   
    let date = new Date();
    time = Math.round(
      Math.abs(date.getMinutes() * 60 + date.getSeconds() - time) / 6.5
    );
    time = time;
    setTimeout(() => {
      gaming(data, time);
    }, 10000);
  }
  function gaming(data, time) {

    if (time >= 90) {
      return clearTimeout();
    }
    if (
      time > document.getElementsByClassName("addedToList").length &&
      time <= 90
    ) {
      for (let j = 0; j < time; j++) {
        document
          .getElementsByClassName("housie-chart-class")
          [data[j] - 1].classList.add("addedToList");
      }
    }
    if (data.length > 0 && data.length <= 90) {
      document
        .getElementsByClassName("housie-chart-class")
        [data[time] - 1].classList.add("addedToList");
    }
    setTimeout(() => {
      gaming(data, ++time);
    }, 6500);
  }
</script>

<style>

</style>

<main id="housieContainer" class="goLeft">
  <div id="housie-chart" />
</main>
