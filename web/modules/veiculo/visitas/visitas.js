(function() {
	app.controller('visitasListCtrl', ['$scope', '$rootScope', '$state', '$filter', '$modal', function ($scope, $rootScope, $state, $filter, $modal) {
		$scope.botoes = [
			{'acao':'registarVisita', 'nome':'Registrar Visita', 'icone':'fa fa-plus', 'disabled':false},
			{'acao':'goVeiculos', 'nome':'Lista de Veículos', 'icone':'fa fa-car', 'disabled':false},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$scope.registarVisita = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
			  resolve: {
		        visita: function () {
		          return undefined;
		        }
		      }
			});
		};
		$scope.visualizarVisita = function(e, visita){
			e.stopPropagation();
			$scope.visita = visita;
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
			  resolve: {
		        visita: function () {
		          return $scope.visita;
		        }
		      }
			});
		};
		$scope.registrarSaida = function(e, placa){
			e.stopPropagation();
			var form = {url:'api/veiculo/registrar_saida_veiculo.php', data:{'placa':placa}};
			$rootScope.request(form, function(data){
				$scope.listaVisitas();
			});
		};		
		$scope.goVeiculos = function(){
			$state.go("app.veiculo.list");
		};
		$scope.setVeiculosSemSaida = function(){
			if($scope.veiculosSemSaida==true){
				$scope.ft.data_saida = null;
			}else{
				delete $scope.ft.data_saida;
			}
		};
		$scope.listaVisitas = function(){
			var data = {'url':'api/veiculo/listar_visitas.php', 'data':{} };
			$rootScope.request(data, function(visitas){
				$scope.visitas = visitas;
				var items = $filter('filter')(visitas, {'data_saida':null});
				$rootScope.$emit('flagTotal', {'key':'totalVisitasVeiculos', 'value':items.length});    
			});
		};
		$scope.$on('listaVisitasDeVeiculos', function(){
			$scope.listaVisitas();
		});
		$scope.veiculosSemSaida = false;
		$scope.ft = {};
		$scope.visitas  = [];
		$scope.listaVisitas();
		$scope.filter = $filter;
	}]);

	app.controller('registarVisitaCtrl', ['$scope', '$state', '$rootScope', 'focus', '$document', '$http', '$timeout', '$modalInstance', 'visita', function($scope, $state, $rootScope, focus, $document, $http, $timeout, $modalInstance, visita){
		focus('placa');
		$rootScope.$on('ex9SessionExpired', function(e){
			$modalInstance.close();
		});
		$scope.close = function(){
			$rootScope.$emit('listaVisitasDeVeiculos');
			$timeout(function(){
				$state.go("app.veiculo.visitas");
				$modalInstance.close();
			}, 500);
		};
		$scope.$watch('veiculo.placa', function(placa,o){
			if(o!==placa){
				if(placa){
					$scope.veiculoExterno(function(veiculo){
						$scope.situacao = veiculo;
					}, placa);
					$scope.listarVisitas(placa);
				}
			}
		});
		$scope.veiculoInterno = function(call){
			var data = {url:'api/veiculo/consultar_placa.php', data:{'placa':$scope.placa}};
			$rootScope.request(data, function(data){
				call(data);
			});
		};
		$scope.veiculoExterno = function(call, placa){
			var placa = (placa) ? placa : $scope.placa;
			var data = {url:'api/veiculo/consultar_placa_externo.php', data:{'placa':placa}, nomessage:true};
			$rootScope.request(data, function(data){
				call(data);
			});
		};
		$scope.listarPorPlaca = function(call){
			var data = {url:'api/veiculo/consultar_inicio_placa.php', data:{'placa':$scope.placa}};
			$rootScope.request(data, function(data){
				call(data);
			});
		};
		$scope.getUnidade = function(id){
			var data = {url:'api/unidade/lista_unidade_por_id.php', data:{'id':id}};
			$rootScope.request(data, function(unidade){
				if(!$scope.veiculo){
					$scope.veiculo = {};
				}
				if(unidade && unidade.length){
					$scope.veiculo.unidade = unidade[0];
				}
			});
		};
		$scope.getMorador = function(id){
			var data = {url:'api/morador/lista_morador_por_id.php', data:{'id':id}};
			$rootScope.request(data, function(morador){
				if(!$scope.veiculo){
					$scope.veiculo = {};
				}
				if(morador && morador.length){
					$scope.veiculo.morador = morador[0];
				}
			}, function(){
				$scope.veiculo.morador = {};
			});
		};
		$scope.listarVisitas = function(placa){
			var data = {'url':'api/veiculo/consultar_visitas.php', 'data':{'placa':placa} };
			$rootScope.request(data, function(visitas){
				if(visitas && visitas.length==1){
					$scope.visita = visitas[0];
					if($scope.visita.id_unidade){
						$scope.getUnidade($scope.visita.id_unidade);
					}
					if($scope.visita.id_morador){
						$scope.getMorador($scope.visita.id_morador);	
					}
				}
			});
		};
		$scope.setVeiculo = function(veiculo){
			$scope.veiculo = veiculo;
		};
		$scope.remover = function(){
			$scope.veiculo = {};
			focus('placa');
		}
		$scope.consultarModelo = function(){
			var data = {url:'api/veiculo/consultar_por_modelo.php', data:{'modelo':$scope.modelo}};
			$rootScope.request(data, function(veiculos){
				$scope.veiculos = veiculos;
			});
		};
		$scope.consultarPlaca = function(){
			if($scope.placa && $scope.placa.length==7){
				$scope.veiculoInterno(function(data){
					if(data && data.length==1){
						$scope.veiculo = data[0];
					}else{
						$scope.veiculoExterno(function(results){
							if(!results.error){
								$scope.veiculo = results;
								$scope.veiculo.externo = true;
							}
						});
					}
				});
			}else{
				$scope.listarPorPlaca(function(veiculos){
					$scope.veiculos = veiculos;
				});
			}
		};
		$scope.registrar = function(){
			if($scope.visita && $scope.visita.id){
				var form = {};
				form.url = 'api/veiculo/registrar_saida_veiculo.php';
				form.data = {'placa':$scope.veiculo.placa};
				$rootScope.request(form, function(result){
					$scope.close();
				});
			}else{
				var form = {};
				form.url = 'api/veiculo/registrar_visita_veiculo.php';
				form.data = {};
				if($scope.veiculo && $scope.veiculo.placa){
					form.data.placa = $scope.veiculo.placa;
				}else{
					form.data.placa = $scope.placa;
				}
				
				if($scope.veiculo.unidade && $scope.veiculo.unidade.id){
					form.data.unidade = $scope.veiculo.unidade.id;
				}
				if($scope.veiculo.morador && $scope.veiculo.morador.id){
					form.data.morador = $scope.veiculo.morador.id;
				}
				$rootScope.request(form, function(result){
					$scope.close();
				});				
			}
		};
		$scope.removeBotaoRegistrar = function(){
			$scope.disableRegistrar = true;
		};
		$scope.save = function(){
			if($scope.veiculo.externo){
				$rootScope.request({url:'api/veiculo/registrar_veiculo.php', data:$scope.veiculo}, function(data){
					$scope.registrar();
				});
			}else{
				$scope.registrar();
			}
		};
		

		// Este caso ocorre quando o usuario clica em uma visita da listagem
		if(visita){
			$scope.visita = visita;
			$scope.placa = visita.placa;
			$scope.consultarPlaca();
			
			if(visita.id_unidade){
				$scope.getUnidade(visita.id_unidade);
			}
			if(visita.id_morador){
				$scope.getMorador(visita.id_morador);
			}
			
			if(visita.data_saida){
				$scope.removeBotaoRegistrar();
			}
			
			if($scope.veiculo!=undefined){
				$scope.veiculo.placa = visita.placa;
			}else{
				$scope.veiculo = {placa:visita.placa};
			}
		}
	}]);
})();