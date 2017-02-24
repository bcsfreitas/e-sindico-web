(function() {
	app.controller('veiculosFormCtrl', ['$scope', '$rootScope', '$state', '$filter', function ($scope, $rootScope, $state, $filter) {
		$scope.botoes = [
			{'acao':'goVeiculos', 'nome':'Lista de Veículos', 'icone':'fa fa-list'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$scope.goVeiculos = function(){
			$state.go("app.veiculo.list");
		};
		$scope.save = function(){
			var form = {url:'api/veiculo/registrar_veiculo.php', data:$scope.veiculo};
			$rootScope.request(form, function(){
				$rootScope.$emit('veiculoForm');
			});
		};
		$scope.getVeiculoPorplaca = function(placa, call){
			var form = {url:'api/veiculo/consultar_placa.php', data:{'placa':placa}};
			$rootScope.request(form, function(results){
				call(results);
			});
		};
		$scope.buscarVeiculoExterna = function(){
			if($scope.veiculo.placa && $scope.veiculo.placa.length==7){
				$scope.getVeiculoPorplaca($scope.veiculo.placa, function(results){
					if(results.length){
						$rootScope.$emit('toaster', {type:'error', title:"Veículo Existente", text:"Consta um veículo com esta placa nos registros do sistema."})
					}else{
						var form = {url:'api/veiculo/consultar_placa_externo.php', data:{'placa':$scope.veiculo.placa}};
						$rootScope.request(form, function(results){
							var nome = $scope.veiculo.nome;
							var cpf = $scope.veiculo.cpf;
							$scope.veiculo = results;
							$scope.veiculo.nome = nome;
							$scope.veiculo.cpf = cpf;
						});						
					}
				});
			}
		}
		$scope.init = function(){
			if($state.params.placa){
				$scope.getVeiculoPorplaca($state.params.placa, function(veiculo){
					$scope.veiculo = veiculo[0];
					$scope.veiculo.edit = true;
				});
			}else{
				$scope.veiculo = {};
				$scope.veiculo.edit = false;
			}
		};
		$scope.init();
	}]);

	app.controller('veiculoListCtrl', ['$scope', '$modal', '$rootScope', '$state', '$filter', function ($scope, $modal, $rootScope, $state, $filter) {
		$scope.botoes = [
			{'acao':'form', 'nome':'Cadastrar Veículo', 'icone':'fa fa-plus'},
			{'acao':'goVisitas', 'nome':'Lista de Visitas', 'icone':'fa fa-list'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$scope.goVisitas = function(){
			$state.go("app.veiculo.visitas");
		};
		$scope.listaVeiculos= function(){
			var data = {'url':'api/veiculo/listar_veiculos.php', 'data':{} };
			$rootScope.request(data, function(veiculos){
				$scope.veiculos = veiculos;
			});
		};
		$scope.form = function(placa){
			if(placa){
				console.log('form', placa)
				$state.go("app.veiculo.form", {'placa':placa});
			}else{
				$state.go("app.veiculo.form");
			}
		};
		$scope.$on('veiculoForm', function(){
			$scope.listaVeiculos();
		});
		$scope.veiculos  = [];
		$scope.listaVeiculos();
	}]);

})();