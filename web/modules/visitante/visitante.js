(function() {
	/* Controlador da lista de visitantes */
	app.controller('visitanteListCtrl', ['$scope', '$rootScope', '$state', '$modal', function($scope, $rootScope, $state, $modal){
		$scope.botoes = [
			{'acao':'goPessoas', 'nome':'Listar Visitantes', 'icone':'fa fa-list'},
			{'acao':'modalRegistrarVisita', 'nome':'Registrar Visita', 'icone':'fa fa-user-plus'},
			{'acao':'registrarQrCode', 'nome':'Acesso por QRCode', 'icone':'fa fa-qrcode'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$scope.goPessoas = function(){
			$state.go('app.pessoas');
		};
		$scope.registrarQrCode = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
  			  resolve: {
		        tabs: function () {
		          return 'setTab3';
		        }
		      }
			});
		};
		$scope.registrarPessoa = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
  			  resolve: {
		        tabs: function () {
		          return 'setTab3';
		        }
		      }
			});
		};
		/* Abre o modal que controla os registros de visitantes */
		$scope.modalRegistrarVisita = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
			  resolve: {
		        tabs: function () {
		          return undefined;
		        }
		      }
			});
		};
		$scope.setVisita = function(visita){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
			  resolve: {
		        tabs: function () {
		          return {'acao':'setVisita', 'visita':visita};
		        }
		      }
			});
		};
		$scope.setVisitaSemSaida = function(){
			if($scope.visitaSemSaida==true){
				$scope.ft.dt_saida_visita = null;
			}else{
				delete $scope.ft.dt_saida_visita;
			}
		};
		$scope.listaVisitas = function(){
			$rootScope.request({url:'api/visitante/lista_visitas.php'}, function(results){
				$scope.visitas = results;
			});
		};
		$scope.totalVisitasSemSaida = function(){
			$rootScope.request({url:'api/visitante/total_visitas_em_aberto.php'}, function(results){
				$rootScope.$emit('flagTotal', {key:'totalVisitas', value:results.length});
			});
		};
		$rootScope.$on('listaVisitas', function(){
			$scope.listaVisitas();
		});
		$scope.listaVisitas();
		$scope.totalVisitasSemSaida();
		$scope.ft = {};
	}]);

	/* Listagem de pessoas viitantes */
	app.controller('pessoasListCtrl', ['$scope', '$rootScope', '$window', '$state', '$modal', function($scope, $rootScope, $window, $state, $modal){
		$scope.botoes = [
			{'acao':'registrarPessoa', 'nome':'Cadastrar Visitante', 'icone':'fa fa-plus'},
			{'acao':'listarVisitas', 'nome':'Listar Visitas', 'icone':'fa fa-list'},
		];
		$scope.acao = function(acao){
			$scope[acao]();
		};
		$scope.registrarPessoa = function(){
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
			  resolve: {
		        tabs: function () {
		          return 'setTab2';
		        }
		      }
			});
		};
		$scope.listarVisitas = function(){
			$state.go('app.visitante');
		};
		$scope.listarPessoas = function(){
			var form = {url:'api/visitante/lista_visitantes.php'};
			$rootScope.request(form, function(pessoas){
				$scope.pessoas =  pessoas;
			});
		};
		$scope.gerarQrCode = function(e, pessoa){
			e.stopPropagation();
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalGerarQrcode.html',
			  controller: 'gerarQrcodeCtrl',
			  size: 'lg',
			  resolve: {
		        pessoa: function () {
		          return pessoa;
		        }
		      }
			});
			modalInstance.result.then(function(e){
		      if(e.action=='print'){
		      	$scope.printQrCode = true;
		      	$scope.cpf = e.pessoa.cpf;
		      	$window.print();
		      }
		    });
		};
		$scope.form = function(e, pessoa){
			e.stopPropagation();
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modalRegistrarVisita.html',
			  controller: 'registarVisitaCtrl',
			  size: 'lg',
			  resolve: {
		        tabs: function () {
		          return {'pessoa':pessoa};
		        }
		      }
			});
		};
		$rootScope.$on('listarPessoas', function(){
			$scope.listarPessoas();
		});
		$scope.listarPessoas();
	}]);
	
	/* Modal de controle de acesso de visitantes */
	app.controller('registarVisitaCtrl', ['$scope', '$rootScope', '$http', '$timeout',  '$modalInstance', 'tabs', 'hotkeys', 'focus',  function($scope, $rootScope, $http, $timeout, $modalInstance, tabs, hotkeys, focus){
		$rootScope.$on('ex9SessionExpired', function(e){
			$modalInstance.close();
		});
		/* Atalhos */
		hotkeys.bindTo($scope)
		.add({
	      combo: 'ctrl+x',
	      callback: function(e, hotkey){
	      	e.preventDefault();
	      	$scope.limparInformacoes();
	      }
	    })
	    .add({
	      combo: 'ctrl+left',
	      callback: function(e, hotkey){
	      	e.preventDefault();
	      	$scope.setTab1();
	      }
	    })
	    .add({
	      combo: 'ctrl+up',
	      callback: function(e, hotkey){
	      	e.preventDefault();
	      	$scope.setTab2();
	      }
	    })
	    .add({
	      combo: 'ctrl+right',
	      callback: function(e, hotkey){
	      	e.preventDefault();
	      	$scope.setTab3();
	      }
	    });	

		/* Função para fechar o modal de acesso dos visitantes */
		$scope.close = function(){
			$modalInstance.close();
		};
		$scope.$watch('visitante.nome', function(n,o){
			if(o!=n){
				$scope.listaVisitante('nome', n);
			}
		});
		$scope.$watch('visitante.cpf', function(n,o){
			if(o!=n){
				$scope.listaVisitante('cpf', n);
			}
		});
		$scope.$watch('visitante.rg', function(n,o){
			if(o!=n){
				$scope.listaVisitante('rg', n);
			}
		});		
		$scope.listaVisitante = function(tag, value){
			var data;
			if(tag == 'cpf'){
				data = {url:'api/visitante/lista_visitante_por_like_cpf.php', data:{cpf:value}};
			}else if(tag == 'nome'){
				data = {url:'api/visitante/lista_vivistante_por_nome.php', data:{nome:value}};
			}else if(tag == 'rg'){
				data = {url:'api/visitante/lista_visitante_por_rg.php', data:{rg:value}};
			}
			data.nomessage = true;
			$rootScope.request(data, function(results){
				$scope.visitantes = results;
			});
		};
		$scope.setTab1 = function(){
			//console.log('tab2')
			$scope.tab1.active = true;
			$scope.tab2.active = false;
			$scope.tab3.active = false;
			$timeout(function(){
				focus('cpf1');	
			}, 1000);
		};
		$scope.setTab2 = function(){
			//console.log('tab2')
			$scope.tab1.active = false;
			$scope.tab2.active = true;
			$scope.tab3.active = false;
			$timeout(function(){
				focus('cpf2');	
			}, 1000);
		};
		$scope.setTab3 = function(){
			//console.log('tab2')
			$scope.tab1.active = false;
			$scope.tab2.active = false;
			$scope.tab3.active = true;
		};
		$scope.onQRCodeReader = function(reader){
			$rootScope.request({url:'api/visitante/lista_visitante_por_cpf.php', data:{cpf:reader}}, function(results){
				if(results.length>0){
					$scope.visitante = results[0];
					$scope.setTab1();
				}
			});
		};
		$scope.limparInformacoes = function(){
			$scope.visitante = {};
		};
		$scope.tab1 = {active:true};
		$scope.tab2 = {active:false};
		$scope.tab3 = {active:false};
		/* Salva um novo ou edita um visitante */
		$scope.save = function(){
			var form = {'url':'api/visitante/cadastro.php', 'data':$scope.visitante};
			$rootScope.request(form, function(success){
				//$rootScope.$emit('listaVisitas');
				$rootScope.$emit('listarPessoas');
				$scope.setTab1();
			});
		};
		$scope.registrarVisita = function(){
			$rootScope.request({url:'api/visitante/registrar_visita.php', data:$scope.visitante}, function(result){
				$rootScope.$emit('listaVisitas');
				$scope.close();
			});
		};
		$scope.setVisitantes = function(visitante){
			if($scope.visitante.id == visitante.id){
				$scope.visitante = {};
			}else{
				$scope.visitante = visitante;
			}
		};
		$scope.setVisita = function(){
			$scope.setTab1();
			$rootScope.request({url:'api/visitante/lista_visitante_por_id.php', data:{'id':tabs.visita.id_visita_pessoa}}, function(results){
				$scope.visitante = results[0];
				$scope.visitante.cpf = tabs.visita.cpf;
			}, function(error){
				$scope.visitante = {cpf:tabs.visita.cpf};
			});
		}
		$timeout(function(){
			if(typeof tabs == 'string'){
				$scope[tabs]();
			}
			if(typeof tabs == 'object'){
				$scope[tabs.acao]();
			}
		});
		$scope.visitante = {};
	}]);

	app.controller('gerarQrcodeCtrl', ['$scope', '$rootScope', '$http', '$window', '$timeout',  '$modalInstance', 'pessoa',  function($scope, $rootScope, $http, $window, $timeout, $modalInstance, pessoa){
		$scope.pessoa = pessoa;
		$scope.print = function(){
			$modalInstance.close('print');
		};
		$scope.close = function(){
			$modalInstance.close();
		};
		$scope.printModal = true;
	}]);

})();