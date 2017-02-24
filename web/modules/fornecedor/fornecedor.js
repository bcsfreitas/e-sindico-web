(function() {	
	app.controller('fornecedorFormCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', 'fileUpload', '$modal', function ($scope, $state, $rootScope, $http, $timeout, fileUpload, $modal) {
		
		$scope.save = function(){
		
			$rootScope.request({url:'/fornecedor/add', data:$scope.fornecedor}, function(response){
		        if(response && response.message){
					$rootScope.$emit('toaster', {type:'success', title:response.message});
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:"Não foi possível realizar o cadastro"});
		        }
		    });
		};

		$scope.upload = function(call){
			if($state.params.id){
				id = $state.params.id;
			}else{
				id = $scope.usuario.id;	
			}
	      var url =  $rootScope.url + '/fornecedor/upload/'+id+"/"+$state.params.companyId;
	      fileUpload.uploadFileToUrl($scope.image, url, 2510161500, call);
	    };

	    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
	      if(requestCode == 2510161500){
	        if(error==false){
	            call(response.user.imageUrl);
	        }else{
	          $rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar o upload imagem. Erro: "+response.message})
	        }
	      }
	    });		

	}]);

})();