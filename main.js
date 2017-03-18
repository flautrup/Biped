// main.js
const wifi = require('Wifi')  // This is one of our magic, native Espruino friends.
var ws;

var current = { D4: 50, D5: 50, D12: 50, D14:50 };

//Use wifi.save() to store wifi information

var page = '<html><body><script>var ws;setTimeout(function(){';
page += 'ws = new WebSocket("ws://" + location.host + "/biped_websocket", "JSON");';
page += 'ws.onmessage = function (event) { console.log("MSG:"+event.data); };';
page += 'setTimeout(function() { ws.send("Hello to Espruino!"); }, 1000);';
page += '},1000);</script></body></html>';

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
//Make the pulse run all the time and use an event to trigger changes.
const move = (port, value, callback) => {
  var steps = 0;

  console.log(value);

  interval = setInterval(function () {
    if (steps >3) {
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

//Round number 
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

//Start the pulse to servos
const startPwM = () => {
  console.log("Start PwM");
  interval = setInterval(function () {
    digitalPulse(D4, 1, 1 + E.clip(round(current.D4/100,2), 0, 1));
    digitalPulse(D5, 1, 1 + E.clip(round(current.D5/100,2), 0, 1));
    digitalPulse(D12, 1, 1 + E.clip(round(current.D12/100,2), 0, 1));
    digitalPulse(D14, 1, 1 + E.clip(round(current.D14/100,2), 0, 1));
    //digitalPulse(port, 1, 1.5);
    //steps++;
  }, 20);
}



//Write a response 200 with message on res
const httpResp = (res, message) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(message);
  console.log(message);
}

var parseWS = (data) => {
  if (current.D4 != data.D4) {
    current.D4=data.D4;
    //move("D4", data.D4 / 100);
  }
  if (current.D5 != data.D5) {
    current.D5=data.D5;
    //move("D5", data.D5 / 100);
  }
  if (current.D12 != data.D12) {
    current.D12=data.D12;
    //move("D12", data.D12 / 100);
  }
  if (current.D14 != data.D14) {
    current.D14=data.D14;
    //move("D14", data.D14 / 100);
  }
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
//  wstest return test page for websocket
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
  } else if (RESTReq.action == "wstest") {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page);
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
      move(RESTReq.port, RESTReq.value / 100);
    } else {
      move(RESTReq.port, 0);
    }
    httpResp(res, JSON.stringify(RESTReq));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(JSON.stringify(RESTReq));
  }
};

// Init function.
function main() {
  wifi.on('connected', function (details) {
    console.log(`successfully connected to` + details.ip);
    lightOn(); // Again, this is just a reminder that we are wifi connected now
  });

  var details = wifi.getDetails();
  if (details.status == "connected") {
    lightOn();
  }

  //Start web listener on port 3000 for REST API.

  var server = require('ws').createServer(onPageRequest)
  server.listen(3000);
  server.on("websocket", function (w) {
    console.log("WS Connected");
    startPwM();
    ws = w;
    ws.on('close', function () { console.log("WS closed"); });
    ws.on('message', function (msg) {
      print("[WS] " + JSON.stringify(msg));
      servoState = JSON.parse(msg);
      console.log(servoState);
      parseWS(servoState);
    })
    ws.send("Hello from Espruino!");
  })
};