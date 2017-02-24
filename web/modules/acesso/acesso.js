(function() {
	app.config(function ($httpProvider) {
	  $httpProvider.defaults.headers.common = {};
	  $httpProvider.defaults.headers.post = {};
	  $httpProvider.defaults.headers.put = {};
	  $httpProvider.defaults.headers.patch = {};
	});
	app.controller('signinCtrl', ['$scope', 'focus', '$localStorage', '$rootScope', '$http', '$state', '$timeout', function ($scope, focus, $localStorage, $rootScope, $http, $state, $timeout) {
		focus('email');
		
		$scope.authError = null;
		$scope.spin = false;


		$scope.user = {};	    

	    $scope.login = function() {
	     
	      $scope.spin = true;
	      $scope.authError = null;

	      $rootScope.request({url: '/login', data:{'tx_email': $scope.user.email, 'tx_senha': $scope.user.pass}}, function(response){
	      	  if(response && response.error==true){
	            $scope.authError = response.message;
	      	  }else{

				$timeout(function(){
					$rootScope.$emit('toaster', {title:"Informação de Login", text:"Você está autenticado!", type:'success'});	
				}, 500);
	      	  	  
				$rootScope.app.user = response.data;
				$scope.spin = false;
				$state.go("app.grafico");
				
			  }

	      }, function(response, error){
	      	if(response && response.message){
	      		$scope.authError = response.message;
	      	}else{
	      		$scope.authError = "Erro ao tentar efetuar o acesso.";
	      	}
	      	$scope.spin = false;
	      });
	    };


	    $scope.clearFields = function(){
    		$scope.user.passNew = "";
    		$scope.user.passNewConfirm = "";
    		$scope.user.passBefore = "";
	    };

	    $scope.alterPass = function(){

			
	    	if($scope.user.passNew != $scope.user.passNewConfirm){
	    		$scope.authError = "Senhas diferentes";
	    		$scope.messageSuccess = undefined;
	    		$scope.clearFields();
	    	}else{

			  $scope.authError = undefined;
			  $scope.authError = undefined;
	    	  $scope.spin = true;

		      $rootScope.request({method:'PUT', url: '/pessoa/changepassword', 
		      	data:{
		      	'tx_email': $scope.user.email, 
		      	'tx_novasenha': $scope.user.passNew, 
		      	'tx_senhaantiga': $scope.user.passBefore}
		      	}, function(response){
		      	  $scope.spin = false;
		      	  if(response && response.error==true){
		            $scope.authError = response.message;
		            $scope.clearFields();
		      	  }else{

					$scope.authError = undefined;
		      	  	$scope.messageSuccess = response.message;
		      	  	$timeout(function(){
						$rootScope.$emit('toaster', {title:"Alteração de Senha", text:response.message, type:'success'});	
					}, 500);
		      	  	$scope.clearFields();
										
				  }
		      });

		    }

	    };

	}]);

})();