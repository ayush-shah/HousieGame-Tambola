<script>
  import { afterUpdate, onMount } from "svelte";
  export let num, time, arr;
  onMount(() => {
    housieChart();
  });
  afterUpdate(() => {
    gaming(num, time, arr);
  });
  function housieChart() {
    let x = 0;
    let housieChart = document.getElementById("housie-chart");
    for (x; x < 90; x++) {
      let span = document.createElement("span");
      span.classList.add("housie-chart-class");
      span.innerText = x + 1;
      housieChart.appendChild(span);
    }
  }
  function gaming(data1, index, arr) {
    if (index >= 90) {
      return clearTimeout();
    }
    if (index > document.getElementsByClassName("addedToList").length) {
      for (let j = 0; j < arr.length; j++) {
        document
          .getElementsByClassName("housie-chart-class")
          [arr[j] - 1].classList.add("addedToList");
      }
    }
    document
      .getElementsByClassName("housie-chart-class")
      [data1 - 1].classList.add("addedToList");
  }
</script>

<style>

</style>

<main id="housieContainer">
  <div id="housie-chart" />
</main>
