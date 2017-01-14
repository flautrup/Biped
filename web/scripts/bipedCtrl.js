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
    for(var count=0 ; count < flow.length; count++) {
      $scope.updateServo("D4",flow[count].D4);
      $scope.updateServo("D5",flow[count].D5);
      $scope.updateServo("D12",flow[count].D12);
      $scope.updateServo("D14",flow[count].D14);
    }
  }

  $scope.updateServo = (port, value) => {
      url="http://"+$scope.server+"/servo/"+port+"/"+value;
      $http.get(url).success(console.log(url));
  }
}]);