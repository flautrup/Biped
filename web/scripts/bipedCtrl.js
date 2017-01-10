angular.module('BiPed', ['ngMaterial'])
.controller('AppCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.servo = {
    D5: 50,
    D4: 50,
    D12: 50,
    D14: 50
  };

  $scope.server="192.168.1.115:8080"

  $scope.updateServo = (port, value) => {
      url="http://"+$scope.server+"/servo/"+port+"/"+value;
      $http.get(url).success(console.log(url));
  }
}]);