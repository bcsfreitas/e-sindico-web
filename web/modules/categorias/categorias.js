(function() {
	app.controller('categoriasFormCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout',  function ($scope, $state, $rootScope, $http, $timeout) {
		
		$scope.save = function(){
			if($scope.categoria.id_categoria==undefined){
				// Status pendente
				$scope.categoria.tx_status = 'P';
				$rootScope.request({method:'POST', url:'/categoria/add', data: $scope.categoria}, function(response){
			        if(response && response.data){
			        	$scope.categoria = {};
			          $rootScope.$emit('toaster', {type:'success', title:response.message});
			          $scope.listaCategorias();
			        }else{
			          $rootScope.$emit('toaster', {type:'error', title:response.message});
			        }
			    });
			}else{
				$rootScope.request({method:'PUT', url:'/categoria/update', data: $scope.categoria}, function(response){
			        if(response && response.error==false){
			        	$rootScope.$emit('toaster', {type:'success', title:response.message});
			          $scope.listaCategorias();
			          $scope.categoria = {};
			        }else if(response.message){
			          $rootScope.$emit('toaster', {type:'error', title:response.message});
			        }
			    });
			}
		};

		$scope.setEdit = function(categoria){
			categoria.tx_status = 'A';
			alert(categoria.tx_status);
			$scope.categoria = categoria;
		};

		$scope.delete = function(id){
			console.log('inicio do deltar', id);
			$rootScope.request({method:'DELETE', url:'/categoria/del', data:{"id_categoria":id} }, function(response){
				console.log('response', response);
		        if(response && response.data){
		        	$rootScope.$emit('toaster', {type:'success', title:response.message});
		          $scope.listaCategorias();
		        }else if(response.message){
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		          $scope.listaCategorias();
		        }
		    });
		};

		$scope.listaCategorias = function(){
			$rootScope.request({method:'GET', url:'/categoria/listall'}, function(response){
		        if(response && response.data){
		          $scope.results = response.data;
		        }
		    });
		}

		$scope.listaCategorias();
	}]);

	app.controller('subFormCtrl', ['$scope', '$state', '$rootScope', function($scope, $state, $rootScope){
		$scope.listaSubCategorias = function(id_categoria){
			$rootScope.request({method:'GET', url:'/subcategoria/listForCategory/'+id_categoria}, function(response){
		        if(response && response.error==false){
		        	$scope.subs = response.data;
		        }else{
		        	$rootScope.$emit('toaster', {type:'error', title:response.message});
		        }
		    });
		}

		$scope.atualizarSubCategoria = function(id_subcategoria, id_categoria, tx_descricao, tx_status){
			var data = {};
			data.id_subcategoria = id_subcategoria;
			data.id_categoria = id_categoria;
			data.tx_descricao = tx_descricao;
			data.tx_status = tx_status;

			$rootScope.request({method:'PUT', url:'/subcategoria/update', data:data}, function(response){
		        if(response && response.data){
		          $scope.subs = response.data;
		        }
		    });	
		}

		$scope.listaCategorias = function(){
			$rootScope.request({method:'GET', url:'/categoria/listall'}, function(response){
		        if(response && response.data){
		          $scope.categorias = response.data;
				}
		    });
		}

		$scope.save = function(){
			var data = $scope.subItem;
			data.tx_status = "A";
			data.id_categoria = $scope.id_categoria;

			if(data.id_subcategoria==undefined){
				$rootScope.request({method:'POST', url:'/subcategoria/add', data:data }, function(response){
			        if(response && response.data){
			          $scope.subs = response.data;
			          $scope.subItem = {};
			          $scope.listaSubCategorias(data.id_categoria);
			        }
			    });
			}else{
				data.id_categoria = $scope.id_categoria;
				$rootScope.request({method:'PUT', url:'/subcategoria/update', data:data }, function(response){
			        if(response && response.data){
			          $scope.subs = response.data;
			          $scope.subItem = {};
			          $scope.listaSubCategorias(data.id_categoria);
			        }
			    });
		    }
		}	

		$scope.delete = function(id_subcategoria, id_categoria){
			var data = {};
			data.id_subcategoria = id_subcategoria;
			$rootScope.request({method:'DELETE', url:'/subcategoria/remove', data:data }, function(response){
		        if(response && response.data){
		          $scope.subs = response.data;		
		          $scope.listaSubCategorias(id_categoria);
		        }
		    });
		}

		$scope.setEdit = function(sub){
			$scope.subItem = sub;
		}

		$scope.nova = function(){
			$scope.subItem = {};
		}

		$scope.catSelecionada = function(id){
			$scope.id_categoria = id;
			$scope.listaSubCategorias(id);
		}

		$scope.listaCategorias();
	}]);

})();