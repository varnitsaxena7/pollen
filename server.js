const express = require("express");
const https = require("https");
const path = require("path");

const app = express();
const port = 3000;

// Function to make the API request
function makeRequest(city, callback) {
  const options = {
    method: "GET",
    hostname: "api.ambeedata.com",
    port: null,
    path: `/latest/pollen/by-place?place=${encodeURIComponent(city)}`,
    headers: {
      "x-api-key": "0477636ea50bc6a92891f7291a3ab480c6b50b2abe69634ee0d3ff6a19c70512",
      "Content-type": "application/json"
    }
  };

  const req = https.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      callback(null, body.toString());
    });
  });

  req.on("error", (e) => {
    callback(e);
  });

  req.end();
}

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle API requests
app.get("/getPollenData", (req, res) => {
  const city = req.query.city;
  if (city) {
    makeRequest(city, (err, data) => {
      if (err) {
        res.status(500).send("Error fetching data from API");
      } else {
        res.status(200).json(JSON.parse(data));
      }
    });
  } else {
    res.status(400).send("City not provided");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
