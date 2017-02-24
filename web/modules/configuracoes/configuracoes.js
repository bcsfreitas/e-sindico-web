(function() {
	// Lista as encomendas e aplica seus filtros
	app.controller('configuracoesCtrl', ['$scope', '$rootScope', '$http', '$filter', '$timeout', '$window', '$modal', function ($scope, $rootScope, $http, $filter, $timeout, $window, $modal) {
		$scope.getConfiguracoes = function(){
			$rootScope.request({url:'api/configuracoes/lista_configuracoes.php'}, function(cogs){
				$scope.cogs = cogs;
			});
		};
		$scope.save = function(){
			$rootScope.request({url:'api/configuracoes/registra_configuracoes.php', data:$scope.cogs}, function(){
				
			});
		};
		$scope.receberCodigo = function(){
			$rootScope.request({url:'api/configuracoes/solicitar_codigo_wp.php', data:$scope.cogs}, function(result){
				console.log(result);
			});
		};
		$scope.wpMensagem = function(){
			$rootScope.request({url:'api/configuracoes/enviar_wp.php', data:$scope.cogs}, function(result){
				console.log(result);
			});
		};
		$scope.getConfiguracoes();
	}]);
		
})();