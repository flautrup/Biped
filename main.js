// main.js
const wifi = require('Wifi')  // This is one of our magic, native Espruino friends.

// If you plan to publish your code,
// it's a good idea to keep your wifi name and password in a secure file that you do not version control.
// In this case I've named my file "wifi.config.json"
import CONFIG from './wifi.config.json'
const { name: WIFI_NAME, password: WIFI_PASSWORD } = CONFIG


// Wrap the call to wifi.connect in a native Promise so it's a bit easier to deal with later
const connect = (networkName, options) => {
  console.log(`attempting to connect to network named: ${networkName}`)
  return new Promise((resolve, reject) => wifi.connect(networkName, options, error => {
    const ipAddress = wifi.getIP().ip
    if (error) reject(error)
    else resolve(ipAddress)
  })
  )
}

//Turn on blue light
const lightOn = () => {
  digitalWrite(D2, isOn = false)
  console.log('A blue LED should be on...')
}

//Turn off blue light
const lightOff = () => {
  digitalWrite(D2, isOn = true)
  console.log(`The blue light should be off...`)
}

//Test sequence for servos 0,1,1.5,0
const testServo = (port) => {
  move(port, 0, function () {
    move(port, 1, function () {
      move(port, .5, function () {
        move(port, 0)
      })
    })
  })
}

//Move servo on port to value and call callback when ready.
//Todo: Use promise instead of callback.
const move = (port, value, callback) => {
  var steps = 0;

  console.log(value);

  interval = setInterval(function () {
    if (steps > 20) {
      clearInterval(interval);
      interval = undefined;
      steps = 0;
      if (callback) callback();
    }
    digitalPulse(port, 1, 1 + E.clip(value, 0, 1));
    //digitalPulse(port, 1, 1.5);
    steps++;
  }, 20);
}

//Write a response 200 with message on res
const httpResp = (res, message) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(message);
  console.log(message);
}

//Parse get request path in the form of /action/port/value and return object
var parseREST = (req) => {
  var RESTReq = {};
  var a = url.parse(req.url, true);

  var pathParts = a.pathname.split("/");
  //console.log(pathParts);

  if (pathParts.length == 2 && pathParts[1] == "") {
    RESTReq.action = "default";
  }

  if (pathParts.length > 1) {
    RESTReq.action = pathParts[1];
  }

  if (pathParts.length > 2) {
    RESTReq.port = pathParts[2];
  }

  if (pathParts.length > 3) {
    RESTReq.value = pathParts[3];
  }

  console.log(JSON.stringify(RESTReq));
  return RESTReq;

}

//REST API definition using /action/port/value as parameters.
//Action is what to do
//Port in on what port
//Value is the value to use on the port for the action.
//Defined actions
//  No action return version
//  Hello return Hello World
//  ledOn turn on red led
//  ledOff turn on red led
//  wifi return status information on wifi connection
//  write write value to port using digitalWrite
//  servo send PWM value to port (50hz), using test as value will run test cycle

function onPageRequest(req, res) {
  //Path mapping to function for REST API
  var RESTReq = parseREST(req);

  if (RESTReq.action == "default") {
    httpResp(res, "BIPed REST API 0.1");
  } else if (RESTReq.action == "hello") {
    httpResp(res, "Hello World")
  } else if (RESTReq.action == "ledOn") {
    digitalWrite(D0, false);
    httpResp(res, "Red Led On");
  } else if (RESTReq.action == "ledOff") {
    digitalWrite(D0, true);
    httpResp(res, "Red Led Off");
  } else if (RESTReq.action == "wifi") {
    httpResp(res, JSON.stringify(wifi.getStatus()) + JSON.stringify(wifi.getIP()));
  } else if (RESTReq.action == "write") {
    digitalWrite(RESTReq.port, RESTReq.value);
    httpResp(res, JSON.stringify(RESTReq));
  } else if (RESTReq.action == "servo") {
    if (RESTReq.value == "test") {
      testServo(RESTReq.port);
    } else if (RESTReq.value > 0) {
      move(RESTReq.port, RESTReq.value / 10);
    } else {
      move(RESTReq.port, 0);
    }
    httpResp(res, JSON.stringify(RESTReq));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify(RESTReq));
  }
}

// Init function.
function main() {
  wifi.stopAP() // Don't act as a Wifi access point for other devices
  // Save a reference to the attempt that we can pass around.
  const connectionAttempt = connect(WIFI_NAME, { password: WIFI_PASSWORD })
    .then(ip => {
      console.log(`successfully connected to ${ip}`)
      lightOn() // Again, this is just a reminder that we are wifi connected now
    })
    .then(() => {
      // From here on you have wifi access.
      wifi.on('disconnected', () => {
        lightOff()
        console.log(`successfully disconnected...`)
      })
      //Start web listener on port 8080 for REST API.
      var http = require("http");
      http.createServer(onPageRequest).listen(8080);
    });
  //.catch(error => {
  //console.error(error)
  //})


}