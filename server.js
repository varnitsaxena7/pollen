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
      "x-api-key": "14184262b40c484353e405e887f47d9f537b6c1d47edcbf11a2b725a09e84121", // Make sure this API key is valid
      "Content-type": "application/json"
    }
  };

  const req = https.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks).toString();
      console.log("API Response:", body);  // Log the API response for debugging
      callback(null, body);
    });
  });

  req.on("error", (e) => {
    console.error("Error:", e); // Log the error for debugging
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
        console.error("Error fetching data from API:", err);
        res.status(500).send("Error fetching data from API");
      } else {
        try {
          const parsedData = JSON.parse(data);
          res.status(200).json(parsedData);
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
          res.status(500).send("Error parsing API response");
        }
      }
    });
  } else {
    res.status(400).send("City not provided");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
