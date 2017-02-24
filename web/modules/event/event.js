(function() {
  app.controller('eventFormCtrl', ['$scope', '$rootScope', '$localStorage', '$state', '$http', '$modal', '$timeout', 'fileUpload', function ($scope, $rootScope, $localStorage, $state, $http, $modal, $timeout, fileUpload) {

    $scope.save = function(){
      var event = $scope.event;
      event['companyId'] = $state.params.companyId;
      $rootScope.request({method:'event', url:'/event', data:event}, function(response){
        if(response && response.event){
          $scope.event = response.event;
          $rootScope.$emit('toaster', {type:'success', title:"Informações Salvas", text:response.message});
                
          if($scope.image){
            $scope.upload(function(path){
              $scope.event.imageUrl = path+"?random="+Math.random();
              $rootScope.$emit('toaster', {type:'success', title:"Upload da imagem realizado"});
            });
          }else{
            $rootScope.$emit('toaster', {type:'success', title:"Informações Salvas", text:response.message});
            $state.go("app.empresa.event", {'companyId':$state.params.companyId, 'pageId':$state.params.pageId});
          }

          $rootScope.$emit('eventListarNoticias');  

        }
      });
    };

    $scope.upload = function(call){
      var url =  $rootScope.url + '/event/'+$scope.event.id+'/uploadImage';
      fileUpload.uploadFileToUrl($scope.image, url, 1710161844, call);
    };

    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
      if(requestCode == 1710161844){
        if(error==false){
            $scope.event.imageUrl = response.path;
            $scope.init();
        }else{
          $rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar o upload imagem. Erro: "+response.message})
        }
      }
    });
  
    $scope.getevent = function(id){
      $rootScope.request({method:'get', url:'/event/' + id}, function(response){
        $scope.event = response.event;
      });
    };

    $scope.delete = function(){
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modalBaseDeletar.html',
        controller: 'eventDelCtrl',
        size: 'lg',
        resolve: {
            event: function () {
              return $scope.event;
            }
          }
      });
    };

    $scope.init = function(){
      if($state.params.id){
        $scope.getevent($state.params.id);
      }
    };

    $scope.init();

  }]);

  app.controller('eventDelCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'event', function ($scope, $rootScope, $state, $http, $modalInstance, event) {
    $scope.title = event.title;

    $scope.close = function(){
      $modalInstance.close();
    };

    $scope.deletar = function(){
      $rootScope.request({method:'delete', url:'/event', data:event, nomessage:true}, function(results){
        if(results){
          $modalInstance.close();
          $rootScope.$emit('eventListarNoticias');
          $state.go('app.empresa.event', {'companyId':$state.params.companyId, 'pageId':$state.params.pageId});
        }
      });
    };

  }]);

  app.controller('eventListCtrl', ['$scope', '$rootScope', '$localStorage', '$stateParams', '$state', '$http', function ($scope, $rootScope, $localStorage, $stateParams, $state, $http) {
    $scope.params = $state.params;

    $rootScope.$on('eventListarNoticias', function(){
      $scope.listarNoticias();
    });

    $scope.botoes = [
      {'acao':'form', 'nome':'Cadastrar Notícia', 'icone':'fa fa-plus'},
    ];

    $scope.acao = function(acao){
      $scope[acao]();
    };

    $scope.form = function(id){
      if(id)
        $state.go('app.empresa.event.form', {'companyId':$state.params.companyId, 'pageId':$state.params.pageId, 'id':id});
      else
        $state.go('app.empresa.event.form');
    };

    $scope.search = function(search){
      var data = {};
      data.companyId = $state.params.companyId;
      data.numberPage = $state.params.pageId;
      if(search){
        data.search = search;
      }
      $rootScope.request({method:'event', url:'/event/search', data:data}, function(results){
          $scope.results = results;
      });
    }

    $scope.field = {search:""};
    $scope.$watch("field.search", function(newValue, oldValue){
      if(newValue !== oldValue){
        $scope.search(newValue);
      }
    });

    $scope.listarEventos = function(){
      $scope.search();
    };

    $scope.listarEventos();

  }]);
})();