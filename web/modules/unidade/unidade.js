(function() {
	
	app.constant("CON_UNIDADE", {
		'ruas':['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'], 
		'torres': {'C':['C1'], 'D':['D1','D2'] 'E':['E1'], 'I':['I1', 'I2', 'I3', 'I4'], 'K':['K1'], 'L':['L1'], 'M':['M1'] },
		'apartamentos':['11', '12', '13', '14', '21', '22', '23', '24', '31', '32', '33', '34'],
		'endereco':{'logradouro':'Quadra QC 4', 'cidade':'São Sebastião', 'cidadeEncode':'S%E3o+Sebasti%E3o','estado':'DF', 'bairro':'Jardins Mangueiral'},
		'maxCasas':75}
	);

	app.controller('unidadeListCtrl', ['$scope', '$rootScope', '$state', '$filter', '$http', 'CON_UNIDADE', function ($scope, $rootScope, $state, $filter, $http, CON_UNIDADE) {
		$rootScope.$on('listaUnidades', function(){
			$scope.getUnidades();
		});
		$scope.getUnidades = function(){
			$http({ withCredentials: false, method: 'post', url: 'api/unidade/lista_unidades.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function(data){
				if(data && data.results){
					$scope.unidades = data.results;
					if($scope.unidades && $scope.unidades.length){
						var items = $filter('filter')($scope.unidades, {});
						$rootScope.$emit('flagTotal', {key:'totalUnidades', value:items.length});
					}
				}else{
					$rootScope.$emit('toaster', {type:'error', title:'Listar Encomendas', text:data.error});
				}
			});
		};
		$scope.setUnidade = function(id){
			$state.go('app.unidade.form', {'id':id});
		};
		$scope.form = function(){
			$state.go('app.unidade.form');
		};
		$scope.getUnidades();
	}]);

	app.controller('unidadeFormCtrl', ['$scope', '$rootScope', '$state', '$filter', '$http', 'CON_UNIDADE', function ($scope, $rootScope, $state, $filter, $http, CON_UNIDADE) {
		$scope.maxCasas = CON_UNIDADE.maxCasas;
		$scope.ruas = CON_UNIDADE.ruas;
		$scope.torres = CON_UNIDADE.torres;
		$scope.apartamentos = CON_UNIDADE.apartamentos;
		$scope.und = {};
		$scope.nome = '';
		
		$scope.listagem = function(){
			$state.go('app.unidade');
		};
		$scope.$watch('tipo', function(o, n){
			if(o !== n){
				if(n == '3'){
					$scope.ruas = CON_UNIDADE.ruas;
				}else if(n == '1'||n == '2'){
					$scope.ruas = Object.keys(CON_UNIDADE.torres);
				}
			}
		});
		$scope.$watch('und.rua', function(o, n){
			if(o !== n){
				$scope.getCepByLogradouro();
			}
		});
		$scope.manualCep = false;
		$scope.defineManualCep = function(){
			$scope.manualCep  = true;
		}
		$scope.uri = function(str) {
    		return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A").replace(/\"/g, "%22");
  		};
		$scope.getLogradouroByCep = function(){
			var cep = $scope.und.cep;
			if(cep && !$state.params.id){
				var query = 'select * from htmlpost where url="http://www.buscacep.correios.com.br/servicos/dnec/consultaEnderecoAction.do" and postdata="relaxation='+cep+'&TipoCep=LOG&semelhante=N&cfm=1&Metodo=listaLogradouro&TipoConsulta=relaxation&StartRow=1&EndRow=10" and xpath="//tr[contains(@bgcolor,\'#ECF3F6\')]/td"';
	      		var url = 'http://query.yahooapis.com/v1/public/yql?q=' + $scope.uri(query) + '&format=json&ie=utf-8%27%0A&callback=JSON_CALLBACK&env=http://datatables.org/alltables.env';
				$http.jsonp(url, {cache: false}).success(function(data){
					try{
						var field = data.query.results.postresult.td;
						var logradouro = field[0].content;
						var novaRua = logradouro[logradouro.length-1];
						if(novaRua != $scope.und.rua){
							if($scope.manualCep){
								if(confirm("O CEP que você informou encontrou o endereço: "+ logradouro +", a rua está diferente, deseja atualizar para novo endereço?")){
									$scope.und.rua = novaRua;
								}
							}else{
								$scope.und.rua = novaRua;
							}
						}
					}catch(err){
						$rootScope.$emit('toaster', {type:'error', title:'Consulta de CEP', text:"Erro ao buscar cep pelo endereço: "+logradouro+" Erro: "+String(err)});
					}
				}).error(function(err){
					$rootScope.$emit('toaster', {type:'error', title:'Consulta de CEP', text:"Não foi possível encontrar as informações do endereço. Erro: "+String(err)});
				});
			}
		};
		$scope.getCepByLogradouro = function(){
			var rua = $scope.und.rua;
			if(rua && !$state.params.id){
				var logradouro = CON_UNIDADE.endereco.logradouro + ' Rua ' + rua +' '+ CON_UNIDADE.endereco.cidadeEncode + ' - ' +CON_UNIDADE.endereco.estado;
				logradouro = logradouro.replace(/ /g, '+' );
				var query = 'select * from htmlpost where url="http://www.buscacep.correios.com.br/servicos/dnec/consultaEnderecoAction.do" and postdata="relaxation='+logradouro+'&TipoCep=LOG&semelhante=N&cfm=1&Metodo=listaLogradouro&TipoConsulta=relaxation&StartRow=1&EndRow=10" and xpath="//tr[contains(@bgcolor,\'#ECF3F6\')]/td"';
	      		var url = 'http://query.yahooapis.com/v1/public/yql?q=' + $scope.uri(query) + '&format=json&ie=utf-8%27%0A&callback=JSON_CALLBACK&env=http://datatables.org/alltables.env';
				$http.jsonp(url, {cache: false}).success(function(data){
					try{
						var cep = data.query.results.postresult.td[4].content;
						if($scope.und.cep && $scope.und.cep != cep){
							if($scope.manualCep){
								if(confirm("A Rua que você informou está diferente do CEP preenchido, deseja atualizar o campo com o novo CEP?")){
									$scope.und.cep = cep;
								}
							}else{
								$scope.und.cep = cep;
							}
						}else{
							$scope.und.cep = cep;
						}
					}catch(err){
						$rootScope.$emit('toaster', {type:'error', title:'Consulta de CEP', text:"Erro ao buscar cep pelo endereço: "+logradouro+" Erro: "+String(err)});
					}
				}).error(function(err){
					$rootScope.$emit('toaster', {type:'error', title:'Consulta de CEP', text:"Não foi possível encontrar as informações do endereço. Erro: "+String(err)});
				});
			}
		};
		$scope.getProprietario = function(id, call){
			$rootScope.request({url: 'api/morador/lista_morador_por_id.php', data:{'id':id}}, function(results){
				if(call && results && results.length){
					call(results[0]);
				}
			});
		};
		$scope.getUnidadePorId = function(id, call){
			$rootScope.request({url: 'api/unidade/lista_unidade_por_id.php', data:{'id':id}}, function(results){
				if(call && results && results.length){
					call(results[0]);
				}
			});
		};
		$scope.getMoradoresPorUnidade = function(){
			$rootScope.request({url: 'api/morador/consultar_morador_por_unidade.php', data:{'id_unidade':$scope.und.id}}, function(moradores){
				$scope.moradores = moradores;
			});
		};
		/* Define a unidade apartir do parametro setado na URL ex: /unidades/form/22 o id é 22 */
		
		$scope.defineUnidade = function(){
			var id = $state.params.id;
			if(id){
				$scope.getUnidadePorId(id, function(unidade){
					$scope.und = unidade;
					if(unidade.id_morador){
						$scope.getProprietario(unidade.id_morador, function(morador){
							$scope.und.morador = morador;
						});
					}
					$scope.getMoradoresPorUnidade();
				});
			}
		};
		$scope.save = function(){
			$rootScope.request({url:'api/unidade/cadastro.php', data:$scope.und}, function(){
				$rootScope.$emit('listaUnidades');
				$state.go('app.unidade');
			});
		};
		$scope.defineUnidade();
	}]);
})();