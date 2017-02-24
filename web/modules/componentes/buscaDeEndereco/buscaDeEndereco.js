(function() {
  var app = angular.module('buscaDeEndereco', []);
  app.directive('buscaDeEndereco', function() {
      return {
        restrict: 'E',
        scope: {
          ngModel:'=',
        },
        require: 'ngModel',
        templateUrl: './modules/componentes/buscaDeEndereco/buscaDeEndereco.html',
        controller: 'buscaDeEnderecoCtrl',
        link: function(scope, elm, attrs, ctrl){
          // some awesome jquery pluggin which replaces things and bits
          //$element.replaceWith(angular.element('<pre>' +  $element.text() + '</pre>'));
          if(attrs.required && !scope.ngModel){
            ctrl.$setValidity('required', false);
          }else{
            ctrl.$setValidity('required', true);
          }
        }
      };
  });

  app.controller('buscaDeEnderecoCtrl', ['$scope', '$rootScope', '$http', '$timeout', function($scope, $rootScope, $http, $timeout){
    // $scope.$watch('ngModel', function(o, n){
    //   if(o!==n){
    //     $scope.model = $scope.ngModel;  
    //   }
    // });
    $scope.search = function(){
      $scope.unidades = [];
      var form = {};
      form.url = "api/unidade/pesquisar_unidade.php";
      console.log($scope.unidade);
      if($scope.unidade.logradouro || $scope.unidade.rua || $scope.unidade.numero){
        form.data = {'logradouro':$scope.unidade.logradouro, 'rua':$scope.unidade.rua, 'numero':$scope.unidade.numero};
        $rootScope.request(form, function(unidades){
          $scope.unidades = unidades;
        });
      }
    };
    $scope.setUnidade = function(unidade){
      if($scope.ngModel && $scope.ngModel.id == unidade.id){
        $scope.ngModel = undefined;
      }else{
        $scope.ngModel = unidade;
      }
    };
  }]);

  app.directive('buscaDeMoradorPorEndereco', function() {
      return {
        restrict: 'E',
        scope: {
          ngModel:'=',
          idUnidade:'=',
        },
        require: 'ngModel',
        templateUrl: './modules/componentes/buscaDeEndereco/buscaDeMoradorPorEndereco.html',
        controller: 'buscaDeMoradorPorEnderecoCtrl',
        link: function(scope, elm, attrs, ctrl){
          // some awesome jquery pluggin which replaces things and bits
          //$element.replaceWith(angular.element('<pre>' +  $element.text() + '</pre>'));
          if(attrs.required && !scope.ngModel){
            ctrl.$setValidity('required', false);
          }else{
            ctrl.$setValidity('required', true);
          }
        }
      };
  });
  app.controller('buscaDeMoradorPorEnderecoCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'focus', function($scope, $rootScope, $http, $timeout, focus){
    $scope.id = Math.random();
    $scope.$watch('idUnidade', function(o, n){
        if(o!==n && o){
          $scope.search();
        }
    });
    $scope.search = function(){
      $scope.moradores = [];
      var form = {};
      form.url = "api/morador/consultar_morador_por_unidade.php";
      form.data = {'id_unidade':$scope.idUnidade};
      $rootScope.request(form, function(moradores){
        $scope.moradores = moradores;
      });
    };
    $scope.setMorador = function(morador){
        $scope.ngModel = morador;
        if($scope.call){
          $scope.call({'morador':morador});
        }
    };
    $scope.remover = function(){
      $scope.ngModel = undefined;
      if($scope.remove){
        $scope.remove();
      }
      //focus('morador_' + $scope.id);
    };
  }]);

})();