(function() {
	app.controller('usuarioListCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', '$modal', function ($scope, $state, $rootScope, $http, $timeout, $modal) {
		$scope.botoes = [
			{'acao':'add', 'nome':'Cadastrar Usuário', 'icone':'fa fa-plus'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$rootScope.$on('listaUsuarios', function(){
			$scope.listaUsuarios();
		});
		$scope.listaUsuarios = function(){
			if(!$state.params.pageId){
				var pageId = 1;
			}else{
				var pageId = $state.params.pageId;
			}
			$rootScope.request({method:'get', url:'/company/'+$state.params.companyId+'/person/'+pageId}, function(results){
				$scope.results = results;
			});
		};
		$scope.add = function(){
			$state.go("app.empresa.usuario.form");
		};
		$scope.form = function(id){
			var data = (id) ? {id:id} : {};
			$state.go("app.empresa.usuario.form", data);
		};

		$scope.field = {search:""};
		$scope.$watch("field.search", function(newValue, oldValue){
			if(newValue !== oldValue){
				$rootScope.request({method:'post', url:'/person/search', data:{'companyId':$state.params.companyId, 'search':newValue}}, function(results){
					$scope.results = results;
				});
			}
		});

		$scope.listaUsuarios();
	}]);

	app.controller('usuariorDelCtrl', ['$scope', '$state', '$rootScope', '$modalInstance', 'usuario', function($scope, $state, $rootScope, $modalInstance, usuario){
		$scope.close = function(){
			$modalInstance.close();
		};
		$scope.deletar = function(){
			$rootScope.request({method:'delete', url:'/person/', data:$scope.usuario}, function(response){
				if(response && response.status=="OK"){
					$rootScope.$emit('toaster', {type:'success', title:response.message});
					$rootScope.$emit('listaUsuarios');
					$state.go("app.empresa.usuario");
					$modalInstance.close();	
				}
			});
		};
		$scope.usuario = usuario;
		$scope.title = usuario.name;
	}]);


	app.controller('usuariorManagePermissionCtrl', ['$scope', '$state', '$rootScope', '$modalInstance', 'usuario', function($scope, $state, $rootScope, $modalInstance, usuario){
		$scope.close = function(){
			$modalInstance.close();
		};
		$scope.save = function(){
			var data = {role:$scope.usuario.permission, userId:$scope.usuario.id, companyId:$state.params.companyId};
			$rootScope.request({method:'post', url:'/role/save', data:data}, function(response){
				if(response && response.status=="OK"){
					$rootScope.$emit('toaster', {type:'success', title:response.message});
					$rootScope.$emit('formUsuario');
					$modalInstance.close();
				}
			});
		};
		$scope.usuario = usuario;
	}]);	

	/* Formulário para cadastro e eição de um usuário */
	app.controller('usuarioFormCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', 'fileUpload', '$modal', function ($scope, $state, $rootScope, $http, $timeout, fileUpload, $modal) {
		$scope.botoes = [
			{'acao':'listagem', 'nome':'Lista de Usuários', 'icone':'fa fa-list'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$scope.delete = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalBaseDeletar.html',
			  controller: 'usuariorDelCtrl',
			  size: 'lg',
			  resolve: {
		        usuario: function () {
		          return $scope.usuario;
		        }
		      }
			});
		};

		$scope.passwordRecovery = function(){

			$rootScope.request({url:'/person/password/recovery', data:{'email':$scope.usuario.email}}, function(response){
				if(response && response.status && response.status=="OK"){
					$rootScope.$emit('toaster', {type:'success', title:"Mensagem Enviada", text:response.message});
				}
			});

		};

		$scope.showAlterPass = false;
		$scope.redefinir = function(){
			if(!$scope.showAlterPass){
				$scope.showAlterPass = true;
			}else{
				$rootScope.request({url:'/person/password/alter', data:$scope.usuario}, function(response){
					if(response && response.status && response.status=="OK"){
						$rootScope.$emit('toaster', {type:'success', title:"Senha alterada", text:response.message});
					}
				});
			}
		}

		$scope.managePermission = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalManagePermission.html',
			  controller: 'usuariorManagePermissionCtrl',
			  size: 'lg',
			  resolve: {
		        usuario: function () {
		          return $scope.usuario;
		        }
		      }
			});
		}

		$scope.save = function(){
			$scope.usuario.companyId = $state.params.companyId;
			$rootScope.request({url:'/person/', data:$scope.usuario}, function(response){
		        if(response && response.user){
		          $scope.usuario = response.user;
		          if($scope.image){
		            $scope.upload(function(path){
		              $scope.usuario.imageUrl = path+"?random="+Math.random();
		              $rootScope.$emit('toaster', {type:'success', title:"Upload da imagem realizado"});
		            });
		          }else{
		            $rootScope.$emit('toaster', {type:'success', title:"Informações Salvas", text:response.message});
		          }
		          $rootScope.$emit('listaUsuarios');
		          $state.go('app.empresa.usuario');
		        }else if(response.message){
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }
		    });
		};

		$scope.upload = function(call){
			if($state.params.id){
				id = $state.params.id;
			}else{
				id = $scope.usuario.id;	
			}
	      var url =  $rootScope.url + '/person/uploadImage/'+id+"/"+$state.params.companyId;
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

		$scope.getUsuario = function(){
			if($state.params.id){
				$rootScope.request({method:'get', url:'/person/'+$state.params.id+'/'+$state.params.companyId, nomessage:true}, function(results){
					$scope.usuario = results.user;
				});
			}
		};

		$scope.listagem = function(){
			$state.go('app.empresa.usuario');
		};

		$rootScope.$on('formUsuario', function(){
			$scope.getUsuario();
		});

		$scope.getUsuario();
	}]);

})();