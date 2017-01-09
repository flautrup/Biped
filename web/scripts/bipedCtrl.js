angular.module('BiPed', ['ngMaterial'])
.controller('AppCtrl', function($scope) {
  $scope.servo = {
    D0: 50,
    D4: 50,
    D12: 50,
    D14: 50
  };
});