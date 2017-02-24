(function() {

  app.controller('menuModalCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'menu', function ($scope, $rootScope, $state, $http, $modalInstance, menu) {
    $scope.menu = menu;

    $scope.close = function(){
      $modalInstance.close();
    };

    $scope.save = function(){
      $rootScope.request({method:'post', url:'/menu', data:menu, nomessage:true}, function(results){
        if(results){
          $rootScope.$emit('eventListarMenu');
          $modalInstance.close();
        }
      });
    };

  }]);

  app.controller('menuFormCtrl', ['$scope', '$rootScope', '$localStorage', '$state', '$http', '$modal', '$timeout', function ($scope, $rootScope, $localStorage, $state, $http, $modal, $timeout) {
    $rootScope.$on('eventListarMenu', function(){
      $scope.init();
    });

    $scope.form = function(menu){
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modalMenuForm.html',
        controller: 'menuModalCtrl',
        size: 'lg',
        resolve: {
            menu: function () {
              return menu;
            }
          }
      });
    };

    $scope.listarMenu = function(companyId){
      $rootScope.request({method:'get', url:'/menu/'+companyId}, function(response){
        $scope.menu = response.menu;
      });
    };

    $scope.init = function(){
        $scope.listarMenu($state.params.companyId);
    };

    $scope.init();
  }]);

})();