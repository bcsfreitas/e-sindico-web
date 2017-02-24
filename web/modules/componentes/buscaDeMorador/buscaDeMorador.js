
(function() {
  var app = angular.module('buscaDeMorador', []);
  app.directive('buscaDeMorador', function() {
      return {
        restrict: 'E',
        scope: {
          ngModel:'=',
          endereco:'=',
          call:'&',
          remove:'&',
        },
        require: 'ngModel',
        templateUrl: './modules/componentes/buscaDeMorador/buscaDeMorador.html',
        controller: 'buscaDeMoradorCtrl',
        link: function(scope, elm, attrs, ctrl){
          if(attrs.required && !scope.ngModel){
            ctrl.$setValidity('required', false);
          }else{
            ctrl.$setValidity('required', true);
          }
        }
      };
  });
  app.controller('buscaDeMoradorCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'focus', function($scope, $rootScope, $http, $timeout, focus){
    $scope.id = Math.random();
    $scope.search = function(){
      $scope.moradores = [];
      var form = {};
      form.url = "api/morador/lista_morador_por_nome.php";
      if($scope.nome.length > 1){
        form.data = {'nome':$scope.nome};
        $rootScope.request(form, function(moradores){
          $scope.moradores = moradores;
        });
      }
    };
    $scope.setMorador = function(morador){
        $scope.ngModel = morador;
        $scope.call({'morador':morador});
    };
    $scope.remover = function(){
      $scope.ngModel = undefined;
      $scope.remove();
      focus('morador_' + $scope.id);
    };
  }]);
})();