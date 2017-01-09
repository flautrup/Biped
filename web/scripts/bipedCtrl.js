angular.module('BiPed', ['ngMaterial'])
.controller('AppCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.servo = {
    D0: 50,
    D4: 50,
    D12: 50,
    D14: 50
  };
}]);