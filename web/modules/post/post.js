(function() {
  app.controller('postFormCtrl', ['$scope', '$rootScope', '$localStorage', '$state', '$http', '$modal', '$timeout', 'fileUpload', function ($scope, $rootScope, $localStorage, $state, $http, $modal, $timeout, fileUpload) {

    $scope.save = function(){
      var post = $scope.post;
      post['companyId'] = $state.params.companyId;
      $rootScope.request({method:'post', url:'/post', data:post}, function(response){
        if(response && response.post){
          $scope.post = response.post;
          $rootScope.$emit('toaster', {type:'success', title:"Informações Salvas", text:response.message});
                
          if($scope.image){
            $scope.upload(function(path){
              $scope.post.imageUrl = path+"?random="+Math.random();
              $rootScope.$emit('toaster', {type:'success', title:"Upload da imagem realizado"});
            });
          }else{
            $rootScope.$emit('toaster', {type:'success', title:"Informações Salvas", text:response.message});
            $state.go("app.empresa.post", {'companyId':$state.params.companyId, 'pageId':$state.params.pageId});
          }

          $rootScope.$emit('eventListarNoticias');  

        }
      });
    };

    $scope.upload = function(call){
      var url =  $rootScope.url + '/post/'+$scope.post.id+'/uploadImage';
      fileUpload.uploadFileToUrl($scope.image, url, 1710161844, call);
    };

    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
      if(requestCode == 1710161844){
        if(error==false){
            $scope.post.imageUrl = response.path;
            $scope.init();
        }else{
          $rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar o upload imagem. Erro: "+response.message})
        }
      }
    });
  
    $scope.getPost = function(id){
      $rootScope.request({method:'get', url:'/post/' + id}, function(response){
        $scope.post = response.post;
      });
    };

    $scope.delete = function(){
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modalBaseDeletar.html',
        controller: 'postDelCtrl',
        size: 'lg',
        resolve: {
            post: function () {
              return $scope.post;
            }
          }
      });
    };

    $scope.addCategory = function(){
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modalNewCategory.html',
        controller: 'postNewCategoryCtrl',
        size: 'lg',
        resolve: {
            post: function () {
              return $scope.post;
            }
          }
      });
    };

    $scope.getCategories = function(){
      $rootScope.request({method:'get', url:'/post/categories'}, function(response){
        if(response && response.categories){
          $scope.categories = response.categories;
        }
      });
    }

    $scope.init = function(){
      if($state.params.id){
        $scope.getPost($state.params.id);
        $scope.getCategories();
      }
    };

    $scope.init();

  }]);

  app.controller('postDelCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'post', function ($scope, $rootScope, $state, $http, $modalInstance, post) {
    $scope.title = post.title;

    $scope.close = function(){
      $modalInstance.close();
    };

    $scope.deletar = function(){
      $rootScope.request({method:'delete', url:'/post', data:post, nomessage:true}, function(results){
        if(results){
          $modalInstance.close();
          $rootScope.$emit('eventListarNoticias');
          $state.go('app.empresa.post', {'companyId':$state.params.companyId, 'pageId':$state.params.pageId});
        }
      });
    };

  }]);

  app.controller('postNewCategoryCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'post', function ($scope, $rootScope, $state, $http, $modalInstance, post) {
    $scope.close = function(){
      $modalInstance.close();
    };

    $scope.save = function(){
      $rootScope.request({method:'post', url:'/post/category', data:{'name':$scope.name}, nomessage:true}, function(results){
        if(results){
          $modalInstance.close();
          $rootScope.$emit('eventListarNoticias');
        }
      });
    };

    $scope.post = post;

  }]);

  app.controller('postListCtrl', ['$scope', '$rootScope', '$localStorage', '$stateParams', '$state', '$http', function ($scope, $rootScope, $localStorage, $stateParams, $state, $http) {
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
        $state.go('app.empresa.post.form', {'companyId':$state.params.companyId, 'pageId':$state.params.pageId, 'id':id});
      else
        $state.go('app.empresa.post.form');
    };



    $scope.search = function(search){
      var data = {};
      data.companyId = $state.params.companyId;
      data.numberPage = $state.params.pageId;
      if(search){
        data.search = search;
      }
      if($scope.field.postCategoryId){
        data.postCategoryId = $scope.field.postCategoryId;
      }
      $rootScope.request({method:'post', url:'/post/search', data:data}, function(results){
          $scope.results = results;
      });
    }

    $scope.field = {search:""};
    $scope.$watch("field.search", function(newValue, oldValue){
      if(newValue !== oldValue){
        $scope.search(newValue);
      }
    });


    $scope.$watch("field.postCategoryId", function(newValue, oldValue){
      if(newValue !== oldValue){
        $scope.search();
      }
    });

    $scope.listarNoticias = function(){
      $scope.search();
    };

    $scope.getCategories = function(){
      $rootScope.request({method:'get', url:'/post/categories'}, function(response){
        if(response && response.categories){
          $scope.categories = response.categories;
        }
      });
    }

    $scope.listarNoticias();
    $scope.getCategories();

  }]);
})();