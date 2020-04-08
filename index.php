<?php
if (isset($_POST["submit"])) {
  $username = $_POST["name"];
  if (!isset($_COOKIE["1"])) {
    setcookie("1", "$username", time() + 600, "/");
  }
} ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="manifest" href="manifest.json">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <link rel="apple-touch-icon" href="Images/icon.png" />
  <meta name="apple-mobile-web-app-status-bar" content="#00adb5" />
  <meta name="theme-color" content="#00adb5" />
  <title>Lets Play Housie</title>
  <link rel="stylesheet" href="./global.css" />
  <link rel="stylesheet" href="./build/bundle.css" />
  <script defer src="./build/bundle.js"></script>
</head>
<body>
  <div id="overflowinvisible">
    <div id="login" style="display:block">
      <label for="name">
        Username
      </label>
      <input type="text" name="name" id="username" placeholder="Username" required />
      <input type="button" name="submit" value="Submit" onclick="loadDoc()" />
    </div>
    <div id="overflowInvisible" style="display:none"></div>
  </div>
  </div>
</body>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (event) => {
    window.deferredPrompt = event;
  });

  function cookiesSet() {
    document.getElementById("login").style.display = "none";
    document.getElementById("overflowInvisible").style.display = "block";
  }
  if (document.cookie.match("1=")) {
    cookiesSet();
  }

  function loadDoc() {
    let username = document.getElementById("username").value;
    if (username === "") {
      alert("Please Fill the Username");
    } else {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          if (xhttp.responseText.includes("Ayush")) {
            cookiesSet();
          }
        }
      };
      xhttp.open("POST", "./index.php", true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.send(`name=${username}&submit=submitted`);
    }
  }
</script>

</html>