angular.module('BiPed', ['ngMaterial'])
.controller('AppCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.servo = {
    D5: 50,
    D4: 50,
    D12: 50,
    D14: 50
  };

  $scope.flow=[];

  $scope.server="192.168.1.115:8080"

  $scope.store = (state) => {
    var cloneOfState = JSON.parse(JSON.stringify(state));
    $scope.flow.push(cloneOfState);
  }

  $scope.play = (flow) => {
    var count=0;
    interval= setInterval( function () {
      if(count == flow.length) {
        clearInterval(interval);
      }
      $scope.sendState(flow, count);
      count++;
    },500)
  }

  $scope.sendState = (flow,index) => {
      $scope.updateServo("D4",flow[index].D4);
      $scope.updateServo("D5",flow[index].D5);
      $scope.updateServo("D12",flow[index].D12);
      $scope.updateServo("D14",flow[index].D14);
  }

  $scope.updateServo = (port, value) => {
      url="http://"+$scope.server+"/servo/"+port+"/"+value;
      $http.get(url).then(console.log("Success "+url), console.log("Error "+url));
  }
}]);