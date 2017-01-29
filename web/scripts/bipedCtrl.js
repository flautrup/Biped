angular.module('BiPed', ['ngMaterial'])
.controller('AppCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.servo = {
    D5: 50,
    D4: 50,
    D12: 50,
    D14: 50
  };

  $scope.ws="";
  var lastmessage=Date.now();

  $scope.connectWS = () => {
     var ws;
     ws = new WebSocket("ws://"+$scope.server+ "/biped_websocket", "JSON");
     return (ws);
  }

  $scope.flow=[];

  $scope.server="192.168.1.115:3000"

  $scope.store = (state) => {
    var cloneOfState = JSON.parse(JSON.stringify(state));
    $scope.flow.push(cloneOfState);
  }

  $scope.play = (flow) => {
    var count=0;
    interval= setInterval( function () {
      if(count == flow.length-1) {
        clearInterval(interval);
      }
      $scope.sendState(flow, count);
      count++;
    },500)
  }

  $scope.sendState = (flow,index) => {
      $scope.updateServo(flow[index]);
  }

  $scope.updateServo = (servoState) => {
      //url="http://"+$scope.server+"/servo/"+port+"/"+value;
      //$http.get(url).then(console.log("Success "+url), console.log("Error "+url));
      //Trottle to avoid problem at ESP8266 side
      if(Date.now()-lastmessage > 100 ) {
        $scope.ws.send(JSON.stringify(servoState));
        lastmessage=Date.now();
      }
  }
}]);