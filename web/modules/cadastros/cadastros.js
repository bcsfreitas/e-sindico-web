(function() {

	app.controller('cadastrosFormCtrl', ['$scope', '$state', '$rootScope', '$sce', '$http', '$timeout', '$modal', 'fileUpload', function ($scope, $state, $rootScope, $sce, $http, $timeout, $modal, fileUpload) {

		$scope.save = function(){
			if($scope.fornecedor.id_pessoa == undefined){
				$scope.fornecedor.tx_status = 'P';
				$scope.fornecedor.id_nivel = '4';
				$scope.fornecedor.id_tipo_endereco = '1';
				$rootScope.request({url:'/fornecedor/add', data:$scope.fornecedor}, function(response){
			        if(response && !response.error){
			        	$rootScope.$emit('toaster', {type:'success', title:response.message});	
			        	debugger
						$scope.saveSubs(response.data.id_pessoa);
						$scope.uploadFiles(response.data.id_pessoa);
						$state.go("app.cadastrosform", {'id':response.data.id_pessoa});
			        }else{
			          $rootScope.$emit('toaster', {type:'error', title:response.message});
			        }
			    });
			}else{
				$rootScope.request({method:'PUT', url:'/fornecedor/update', data:$scope.fornecedor}, function(response){
			        if(response && !response.error){
			        	$rootScope.$emit('toaster', {type:'success', title:response.message});	
						$scope.saveSubs(response.data.id_pessoa);
						$scope.uploadFiles($scope.fornecedor.id_pessoa);
			        }else{
			          $rootScope.$emit('toaster', {type:'error', title:response.message});
			        }
			    });
			}
		};

		$scope.uploadFiles = function(id_pessoa){
			if($scope.files.length>0){
				var url =  $rootScope.url + '/fornecedor/uploadDocument/'+id_pessoa;
				for(i=0; i < $scope.files.length; i++){
		      		var header = {};
		    		header['tx-descricao'] = $scope.files[i].documentoDescription;
		    		header['tx-nome'] = $scope.files[i].documentoTitle;

					fileUpload.uploadFileToUrl($scope.files[i].image, url, 12, function(response){
						$rootScope.$emit('toaster', {type:'success', title: response.message});
					}, header);
				};

				$timeout(function() {
					$scope.files = [];
					$scope.init();
				});
			}
		};

		$scope.addContato = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modules/cadastros/modalContato.html',
			  controller: 'addContatoCtrl',
			  size: 'lg',
			  resolve: {
		        contatos: function () {
		          return $scope.fornecedor.contatos;
		        }
		      }
			});
		};

	    $rootScope.$on('uploadService', function(e, response, code, error, requestCode, call){
	      if(requestCode == 12 && error==false){
			call(response);
	      }else{
	      	if(response.message){
				$rootScope.$emit('toaster', {type:'error', text:"Erro ao tentar efetuar upload."});
	      	}else{
	        	$rootScope.$emit('toaster', {type:'error', text:response.message});
	    	}
	      }
	    });

		$scope.saveSubs = function(id_pessoa_fornecedor){
			$rootScope.request({url:'/fornecedor/addSubcategorias', data:{'array_ids':$scope.subsSelected, 'id_pessoa_fornecedor':id_pessoa_fornecedor}}, function(response){
		        if(response && !response.error){
					$rootScope.$emit('toaster', {type:'success', title:response.message});
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }
		    });	
		};

		$scope.listaCategoriasESubcategorias = function(){
			$rootScope.request({method:'GET', url:'/categoria/subcategorias'}, function(response){
		        if(response && !response.error){
		        	$scope.categorias = response.message;
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }
		    });
		};

		$scope.subsSelected = [];
		$scope.toggleSub = function(id) {
			var idx = $scope.subsSelected.indexOf(id);
			if($scope.subsSelected.length <= 5){
			    if (idx > -1) {
			      $scope.subsSelected.splice(idx, 1);
			    }else {
			      $scope.subsSelected.push(id);
			    }
			}else{
				
			    if (idx > -1) {
			      $scope.subsSelected.splice(idx, 1);
			    }else{
			    	$rootScope.$emit('toaster', {type:'error', title:"O limite é 6 subcategorias"});
			    }			
			}
		};

		$scope.$watch('fornecedor.tx_cep', function(newValue, oldValue){
			if(oldValue!==newValue){
				if(newValue.length == 8){
					$scope.validateCep(newValue);
				}
			}
		});

		$scope.$watch('fornecedor.tx_email', function(newValue, oldValue){
			if(oldValue!==newValue){
				$scope.validateEmailListner(newValue);
			}
		});

		$scope.validateEmailListner = function(email){
			$scope.validateEmail = true;
			$rootScope.request({method:"POST", url:'/pessoa/email', data:{'tx_email':email}}, function(response){
		        if(response && !response.error){
				  $state.go("app.cadastrosform", {"id":response.data.id_pessoa});
		        }
		    });
		};

		$scope.validateCep = function(cep){
			validateCep = true;
			var url = "http://correiosapi.apphb.com/cep/"+cep;
			$sce.trustAsResourceUrl(url);
			$http.jsonp(url, {jsonpCallbackParam: 'callback'}).
			success(function(data) {
	    		
	      		validateCep = true;
		    }).
		    error(function(data) {
		    	validateCep = true;
		    	$rootScope.$emit('toaster', {type:'error', title:"Não foi possível validar o CEP."});
		    });
		};

		$scope.changeStatus = function(id_pessoa, status){
			$rootScope.request({method:"PUT", url:'/fornecedor/update/status', data:{'tx_status':status, 'id_pessoa':id_pessoa}}, function(response){
		        if(response && response.error==false){
		          
		    		$scope.getUser($scope.fornecedor.id_pessoa, function(){
		    			$scope.fornecedor.tx_senha = "";
		    		});

		          $rootScope.$emit('toaster', {type:'success', title:response.message});
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }
		    });
		};

		$scope.getUser = function(id_pessoa, call){
			$rootScope.request({method:"GET", url:'/fornecedor/listaPessoaId/'+id_pessoa}, function(response){
		        if(response && !response.error){
		        	$scope.fornecedor = response.data;
		        	$scope.fornecedor.tx_email = response.data.pessoa.tx_email;
		        	$scope.checkSubCategoria(response.data.subcategorias)
		        	call();
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:"Não foi possível realizar o cadastro"});
		        }
		    });
		};

		$scope.checkSubCategoria = function(listaCheckar){
			angular.forEach(listaCheckar, function(item, idx){
				$scope.subsSelected.push(item.id_subcategoria);
			});
		};

		$rootScope.$on('cadastrosFormCtrl.init', function(){
			$scope.init();
		});

		$scope.init = function(){
	    	if($state.params.id){
	    		$scope.getUser($state.params.id, function(){
	    			$scope.fornecedor.tx_senha = "";
	    		});
	    	}
	    };

		$scope.files = [];
	    $scope.init(); 
		$scope.listaCategoriasESubcategorias();
	}]);

	/*app.controller('fornecedorDelCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'fornecedor', function ($scope, $rootScope, $state, $http, $modalInstance, fornecedor) {
		$scope.title = fileItem.tx_nome;
		$scope.close = function(){
		  $modalInstance.close();
		};
		$scope.deletar = function(){
			$rootScope.request({method:'DELETE', url:'/fornecedor/document/delete', data:{"id_documento":fileItem.id}}, function(response){
		        if(response && !response.error){
		        	$rootScope.$emit('toaster', {type:'success', title:response.message});
		        	$rootScope.$emit('cadastrosFormCtrl.init');
					$modalInstance.close();
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }	
		    });
		};
	}]);*/

	app.controller('fileDelCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'fileItem', function ($scope, $rootScope, $state, $http, $modalInstance, fileItem) {
		$scope.title = fileItem.tx_nome;
		$scope.close = function(){
		  $modalInstance.close();
		};
		$scope.deletar = function(){
			$rootScope.request({method:'DELETE', url:'/fornecedor/document/delete', data:{"id_documento":fileItem.id}}, function(response){
		        if(response && !response.error){
		        	$rootScope.$emit('toaster', {type:'success', title:response.message});
		        	$rootScope.$emit('cadastrosFormCtrl.init');
					$modalInstance.close();
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }	
		    });
		};
	}]);

	app.controller('addContatoCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'contatos', function ($scope, $rootScope, $state, $http, $modalInstance, contatos) {
		$scope.close = function(){
		  $modalInstance.close();
		};
		$scope.deletar = function(){
			$rootScope.request({method:'DELETE', url:'/fornecedor/document/delete', data:{"id_documento":fileItem.id}}, function(response){
		        if(response && !response.error){
		        	$rootScope.$emit('toaster', {type:'success', title:response.message});
		        	$rootScope.$emit('cadastrosFormCtrl.init');
					$modalInstance.close();
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }	
		    });
		};
	}]);


	app.controller('cadastrosCtrl', ['$scope', '$state', '$rootScope', '$http', '$timeout', '$modal', function ($scope, $state, $rootScope, $http, $timeout, $modal) {
		$scope.listAll = function(){
			$rootScope.request({method:"GET", url:'/fornecedor/listall'}, function(response){
		        if(response && !response.error){
		        	$scope.forncedores = response.data;
		        	$scope.status = $scope.filtraStatus(response.data);
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.error});
		        }
		    });
		};

		$scope.changeStatus = function(id_pessoa, status){
			$rootScope.request({method:"PUT", url:'/fornecedor/update/status', data:{'tx_status':status, 'id_pessoa':id_pessoa}}, function(response){
		        if(response && !response.error){
		          $scope.fornecedor = undefined;
		          $scope.listAll();
		          $rootScope.$emit('toaster', {type:'success', title:response.message});
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.message});
		        }
		    });
		};

		$scope.filtraStatus = function(lista){
			listaFiltrada = [];
			angular.forEach(lista, function(v, i){
				var idx = listaFiltrada.indexOf(v.tx_status);
			    if (idx > -1) {
			      listaFiltrada.splice(idx, 1);
			    }else {
			      listaFiltrada.push(v.tx_status);
			    }
			});
			return listaFiltrada;
		};

		$scope.listAllCategories = function(){
			$rootScope.request({method:"GET", url:'/categoria/listall'}, function(response){
		        if(response && !response.error){
		        	$scope.categorias = response.data;
		        	$scope.categorias.unshift({'tx_descricao':'Nenhuma', 'id_categoria':undefined});
		        }else{
		          $rootScope.$emit('toaster', {type:'error', title:response.error});
		        }
		    });
		};

		$scope.removeFilter = function(){
			if($scope.search.categorias.id_categoria==undefined){
				delete $scope.search.categorias;
			}
		};

		$scope.init = function(){
			$scope.listAll();
			$scope.listAllCategories();
			// A - Aprovado (Só um Admin pode definir esse status)
			//$scope.fornecedor.tx_status = "A";
		};

		$scope.init();
	}]);

})();