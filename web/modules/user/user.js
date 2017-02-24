(function() {
	app.controller('userListCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', '$modal', 'fileUpload', function ($scope, $state, $rootScope, $http, $timeout, $modal, fileUpload) {
		
		$rootScope.$on('userCtrl.listAll', function(){
			$scope.listAll();
		});

		$scope.listAll = function(){
			$rootScope.request({method:"GET", url:'/pessoa/listall/1'}, function(response){
		        if(response && !response.error){
		        	$scope.pessoas = response.data;
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:"Não foi possível realizar o cadastro"});
		        }
		    });
		};

		$scope.delete = function(pessoa){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalBaseDeletar.html',
			  controller: 'usuariorDelCtrl',
			  size: 'lg',
			  resolve: {
		        pessoa: function () {
		          return pessoa;
		        }
		      }
			});
		};

		$scope.upload = function(id_pessoa, call){
	      var url =  $rootScope.url + '/pessoa/uploadPhoto/'+id_pessoa;
	      fileUpload.uploadFileToUrl($scope.image, url, 1710161844, call);
	    };

	    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
	      if(requestCode == 1710161844){
	        if(error==false){
	            $scope.pessoa.tx_foto = response.path;
	            $scope.init();
	        }else{
	          $rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar o upload imagem. Detalhes: "+response.message})
	        }
	      }
	    });

		$scope.listAll();
	}]);


	app.controller('userFormCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', '$modal', 'fileUpload', function ($scope, $state, $rootScope, $http, $timeout, $modal, fileUpload) {
		
		$scope.save = function(){
			var valid = true;

			if($scope.usuario.alter_pass==true && $scope.usuario.tx_senha_confirm != $scope.usuario.tx_senha){
				$rootScope.$emit('toaster', {type:'error', title:"As senhas não são iguais"});
				valid = false;
			}
			

			if(valid){
			
				if($scope.usuario.id_pessoa==undefined){
					header = {method:"POST", url:'/pessoa/add', data:$scope.usuario};
				}else{
					header = {method:"PUT", url:'/pessoa/update', data:$scope.usuario};
				}

				$rootScope.request(header, function(response){
			        if(response && !response.error){
			        	$rootScope.$emit('toaster', {type:'success', title:response.message});
			        	$scope.usuario = response.data;
			        	if($scope.image){
			        		$scope.upload($scope.usuario.id_pessoa, function(res){
			        			$scope.usuario.tx_foto = response.path;
		        				$rootScope.$emit('toaster', {type:'success', title:"Upload da foto realizado!"});
		        				$state.go("app.user");
			        		});
			        	}else{
			        		$state.go("app.user");
			        	}
			        }else{
			          $rootScope.$emit('toaster', {type:'error', title:"Não foi possível realizar o cadastro"});
			        }
		    	});

			}
			
		};		

		$scope.delete = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalBaseDeletar.html',
			  controller: 'usuariorDelCtrl',
			  size: 'lg',
			  resolve: {
		        pessoa: function () {
		          return $scope.usuario;
		        }
		      }
			});
		};

		$scope.getUser = function(id_pessoa, call){
			$rootScope.request({method:"GET", url:'/pessoa/listaPessoaId/'+id_pessoa}, function(response){
		        if(response && !response.error){
		        	$scope.usuario = response.data;
		        	call();
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:"Não foi possível realizar o cadastro"});
		        }
		    });
		};

		$scope.upload = function(id_pessoa, call){
	      var url =  $rootScope.url + '/pessoa/uploadPhoto/'+id_pessoa;
	      fileUpload.uploadFileToUrl($scope.image, url, 1710161844, call);
	    };

	    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
	      if(requestCode == 1710161844){
	        if(error==false){
	            call(response);
	        }else{
	          $rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar o upload imagem. Detalhes: "+response.message})
	        }
	      }
	    });

	    $scope.init = function(){
	    	if($state.params.id){
	    		$scope.getUser($state.params.id, function(){
	    			$scope.usuario.tx_senha = "";
	    		});
	    	}
	    };

	    $scope.init();

	}]);

	app.controller('usuariorDelCtrl', ['$scope', '$state', '$rootScope', '$modalInstance', 'pessoa', function($scope, $state, $rootScope, $modalInstance, pessoa){
		$scope.close = function(){
			$modalInstance.close();
		};
		$scope.deletar = function(){
			$rootScope.request({method:'DELETE', url:'/pessoa/remove', data:{'tx_email':$scope.pessoa.tx_email}}, function(response){
				if(response && !response.error){
					$rootScope.$emit('toaster', {type:'success', title:response.message});
					$rootScope.$emit('userCtrl.listAll');
					$modalInstance.close();
				}else{
					$rootScope.$emit('toaster', {type:'error', title:response.message});
				}
			});
		};
		$scope.pessoa = pessoa;
		$scope.title = pessoa.tx_email;
	}]);

})();