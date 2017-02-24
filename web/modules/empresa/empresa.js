(function() {
	app.controller('empresaListCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', '$modal', function ($scope, $state, $rootScope, $http, $timeout, $modal) {
	    $rootScope.$on('eventListarEmpresas', function(){
	      $scope.listar();
	    });
		$scope.botoes = [
			//{'acao':'goForm', 'nome':'Cadastrar Usuário', 'icone':'fa fa-plus'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$rootScope.$on('listar', function(){
			$scope.listar();
		});
		$scope.listar = function(){
			$rootScope.request({method:'get', url:'/company/by/person'}, function(response){
				$scope.registros = response.company;
			});
		};
		$scope.select = function(companyId){
			$state.go("app.empresa.form", {'id':companyId});
		};

    $scope.define = function(companyId){
      $state.params.companyId = companyId;
    };    

    $scope.params = $state.params;

		$scope.listar();
	}]);

app.controller('empresaFormCtrl', ['$scope', '$rootScope', '$localStorage', '$state', '$http', '$modal', '$timeout', 'fileUpload', function ($scope, $rootScope, $localStorage, $state, $http, $modal, $timeout, fileUpload) {
    $scope.params = $state.params;
    $scope.save = function(){
      var company = $scope.company;
      $rootScope.request({method:'post', url:'/company', data:company}, function(response){
        if(response && response.company){
          $scope.company = response.company;
          if($scope.image){
            $scope.upload(function(path){
              $scope.company.imageUrl = path+"?random="+Math.random();
              $rootScope.$emit('toaster', {type:'success', title:"Upload da imagem realizado"});
            });
          }else{
            $rootScope.$emit('toaster', {type:'success', title:"Informações Salvas", text:response.message});
            $state.go('app.empresa.form');
          }
          $rootScope.$emit('eventListarEmpresas');
        }else if(response.message){
          $rootScope.$emit('toaster', {type:'error', title:response.message});
        }
      });
    };
  
    $scope.upload = function(call){
      var url =  $rootScope.url + '/company/'+$state.params.companyId+'/uploadImage';
      fileUpload.uploadFileToUrl($scope.image, url, 14587454, call);
    };

    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
      if(requestCode == 14587454){
        if(error==false){
            call(response.company.imageUrl);
        }else{
          $rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar o upload imagem. Erro: "+response.message})
        }
      }
    });

    $scope.getCompany = function(id){
      $rootScope.request({method:'get', url:'/company/'+id}, function(response){
        $scope.company = response.company;
      });
    };

    $scope.init = function(){
      if($state.params.companyId){
        $scope.getCompany($state.params.companyId);
      }
    };

    $scope.init();

  }]);


})();