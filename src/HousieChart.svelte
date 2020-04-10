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
    gaming(data, time);
  }
  let data = [];
  function gaming(data1, index) {
    data.push(data1);
    console.log(data);
    if (index >= 90) {
      return clearTimeout();
    }
    if(index>document.getElementsByClassName('addedToList').length){
    console.log("hey");
      for(let j = 0;j<data.length;j++){
        document.getElementsByClassName('housie-chart-class')[data[j]-1].classList.add('addedToList');
      }
    }
  }
</script>

<style>

</style>

<main id="housieContainer" class="goLeft">
  <div id="housie-chart" />
</main>
