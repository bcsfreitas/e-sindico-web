(function() {
	// Lista as encomendas e aplica seus filtros
	app.controller('encomenda', ['$scope', '$rootScope', '$http', '$filter', '$timeout', '$window', '$modal', function ($scope, $rootScope, $http, $filter, $timeout, $window, $modal) {
		$rootScope.$on('updateEncomenda', function(){
			$scope.getEncomendas();
		});
		$scope.registarEncomenda = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarEncomenda.html',
			  controller: 'registarEncomendaCtrl',
			  size: 'lg',
			});
		};
		$scope.visualizarEncomenda = function(encomenda){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalVisualizarEncomenda.html',
			  controller: 'visualizarCtrl',
			  size: 'lg',
			  resolve: {
		        encomenda: function () {
		          return encomenda;
		        }
		      }
			});
		};
		$scope.registrarSaida = function(e, encomenda){
			e.stopPropagation();
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarSaidaEncomenda.html',
			  controller: 'registarSaidaEncomendaCtrl',
			  size: 'lg',
			  resolve: {
		        encomenda: function () {
		          return encomenda;
		        }
		      }
			});
		};
		$scope.print = function(){
			$window.print();
		};
		$scope.setEncomendaSemSaida = function(){
			if($scope.encomendaSemSaida==true){
				$scope.ft.dt_entrega = null;
			}else{
				delete $scope.ft.dt_entrega;
			}
		};
		$scope.getEncomendas = function(){
			$rootScope.request({url:'api/encomenda/lista_encomendas.php'}, function(results){
				$scope.encomendas = results;
				var items = $filter('filter')($scope.encomendas, {dt_entrega:null});
				$rootScope.$emit('flagTotal', {'key':'totalEncomendas', 'value':items.length});    
			});
		};
		$scope.formataData = function (data) {
			return moment(data).format('DD/MM/YYYY HH:mm')+' ('+moment(data, 'YYYY-MM-DD HH:mm').locale('pt-br').fromNow()+')';
		};

		$scope.init = function(){
			$scope.ft = {};
			$scope.encomendas = [];
			$scope.getEncomendas();
		};
		$scope.init();
	}]);

	/*Abre um modal de previsualização da encomenda em espicifico*/
	app.controller('visualizarCtrl', ['$scope', '$http', '$modalInstance', 'encomenda', function($scope, $http, $modalInstance, encomenda){
		$scope.close = function(){
			$modalInstance.close();
		};
		$scope.formataData = function (data) {
			return moment(data).format('DD/MM/YYYY HH:mm')+' ('+moment(data, 'YYYY-MM-DD HH:mm').locale('pt-br').fromNow()+')';
		};
		$scope.e = encomenda;
	}]);

	/*Abre um modal com opções para registrar a foto de entrega da encomenda*/
	app.controller('registarSaidaEncomendaCtrl', ['$scope', '$rootScope', 'focus', '$document', '$http', '$timeout', '$modalInstance', 'encomenda', function($scope, $rootScope, focus, $document, $http, $timeout, $modalInstance, encomenda){
		$rootScope.$on('ex9SessionExpired', function(e){
			$modalInstance.close();
		});
		$scope.close = function(){
			$modalInstance.close();
			$rootScope.$emit('updateEncomenda');
		};
		$scope.formataData = function (data) {
			return moment(data).format('DD/MM/YYYY HH:mm')+' ('+moment(data, 'YYYY-MM-DD HH:mm').locale('pt-br').fromNow()+')';
		};
		$scope.formataData2 = function (data) {
			return moment(data).format('DD/MM/YYYY HH:mm');
		};
		$scope.registrar = function(){
			var data = {'id':$scope.e.id, 'fotoEntrega':$scope.fotoEntrega};
			$http({ withCredentials: false, method: 'post', url: 'api/encomenda/registrar_entrega.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data:data }).success(function(data){
				if(data){
					$rootScope.$emit('toaster', {type:'success', title:'Registro de Saída de Encomenda', text:data.success});
					$scope.btn = false;
					$timeout(function() {
						$scope.close();
					}, 300);
				}else{
					$rootScope.$emit('toaster', {type:'error', title:'Registro de Saída de Encomenda', text:data.error});
				}
			});
		};
		$scope.btn = true;
		$scope.e = encomenda;
		$scope.dt_entrega = new Date();
	}]);

	/*Registra dados de uma encomenda, remetente, destinatário e foto da encomenda*/
	app.controller('registarEncomendaCtrl', ['$scope', '$rootScope', '$interval', 'focus', '$document', '$http', '$timeout', '$modalInstance', function($scope, $rootScope, $interval, focus, $document, $http, $timeout, $modalInstance){
		$rootScope.$on('ex9SessionExpired', function(e){
			$modalInstance.close();
		});
		$scope.close = function(){
			$modalInstance.close();
			$rootScope.$emit('updateEncomenda');
		};
		$scope.registrar = function() {
			var data = {'remetente':$scope.remetente, 'id_morador':$scope.morador.id, 'observacao':$scope.obs, 'fotoEncomenda':$scope.fotoEncomenda, 'fotoEntrega':undefined};
			$rootScope.request({url:'api/encomenda/registrar.php', data:data}, function(){
				$scope.close();
			});	
		};
	}]);
})();