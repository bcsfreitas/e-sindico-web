(function() {
  app.controller('moradorFormCtrl', ['$scope', '$rootScope', '$state', '$http', '$modal', '$timeout', function ($scope, $rootScope, $state, $http, $modal, $timeout) {
    $scope.listagem = function(){
      $state.go('app.morador');
    };
    $scope.addTelefone = function(){
      var v = $scope.validaTelefone();
      if(v){
        $scope.morador.telefones.push($scope.morador.telefone);
        $scope.morador.telefone = {};
      }
    };
    $scope.delTelefone = function(t){
      $scope.morador.telefones.splice($scope.morador.telefones.indexOf(t), 1);
    };
    $scope.validaTelefone = function(){
      $scope.morador.telefone.error = [];
      var v = true;
      if(!$scope.morador.telefone.telefone){
        $scope.morador.telefone.error.push({show:'O número do telefone é obrigatório'});
        v = false;
      }
      if(!$scope.morador.telefone.descricao){
        $scope.morador.telefone.error.push({show:'A descrião do telefone é obrigatório'});
        v = false;
      }
      return v;
    };
    $scope.save = function(){
      var data = {'url':'api/morador/cadastro.php', 'data':$scope.morador};
      $rootScope.request(data, function(result){
        $rootScope.$emit('listaMoradores');
        $state.go('app.morador');
      });
    };
    $scope.getOpCelular = function(id){
      var operadora = undefined;
      angular.forEach($scope.operadoras, function(op){
        if(op.id == id){
          operadora = op;
        }
      });
      return operadora;       
    };
    $scope.getMoradorPorId = function(id, call){
      var form = {};
      form.url = 'api/morador/lista_morador_por_id.php';
      form.data = {'id' : id};
      $rootScope.request(form, function(result){
        call(result);
      });
    };
    $scope.getUnidadePorId = function(id, call){
      var form = {};
      form.url = 'api/unidade/lista_unidade_por_id.php';
      form.data = {'id' : id};
      $rootScope.request(form, function(result){
        call(result);
      });
    };
    $scope.deletar = function(){
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modalDeletar.html',
        controller: 'moradorDelCtrl',
        size: 'lg',
        resolve: {
            morador: function () {
              return $scope.morador;
            }
          }
      });
    };
    $scope.listaOperadoras = function(){
      $rootScope.request({url:'api/morador/lista_operadoras.php'}, function(operadoras){
        $scope.operadoras = operadoras;
      });
    };
    $scope.init = function(){
      if($state.params.id){
        $scope.getMoradorPorId($state.params.id, function(morador){
          $scope.morador = morador[0];
          if($scope.morador.id_unidade){
            $scope.getUnidadePorId($scope.morador.id_unidade, function(unidade){
              $scope.morador.unidade = unidade[0];
            })
          }
          
        });
      }
      $scope.listaOperadoras();
    };
    $scope.morador = {};
    $scope.morador.telefones = [];
    $scope.morador.telefone = {};
    $scope.init();
  }]);

  app.controller('moradorDelCtrl', ['$scope', '$rootScope', '$state', '$http', '$modalInstance', 'morador', function ($scope, $rootScope, $state, $http, $modalInstance, morador) {
    $rootScope.$on('ex9SessionExpired', function(e){
      $modalInstance.close();
    });
    $scope.close = function(){
      $modalInstance.close();
    };
    $scope.deletar = function(){
      var data = {};
      data.url =  "api/morador/deletar.php";
      data.data = {id:$scope.morador.id};
      $rootScope.request(data, function(){
        $modalInstance.close();
        $rootScope.$emit('listaMoradores');
        $state.go('app.morador');
      });
    };
    $scope.morador = morador;
  }]);

  app.controller('moradorListCtrl', ['$scope', '$rootScope', '$state', '$http', function ($scope, $rootScope, $state, $http) {
    $rootScope.$on('listaMoradores', function(){
      $scope.listaMoradores();
    });
    $scope.form = function(e, id){
      e.stopPropagation();
      if(id)
        $state.go('app.morador.form', {'id':id});
      else
        $state.go('app.morador.form');
    };
    $scope.emailShow = function(e, item){
      e.stopPropagation();
      item.emailShow = true;
    };
    $scope.telShow = function(e, item){
      e.stopPropagation();
      item.telShow = true;
    };
    $scope.listaMoradores = function(){
      $rootScope.request({url:'api/morador/lista_morador.php'}, function(results){
        $scope.moradores = results;
        $rootScope.$emit('flagTotal', {'key':'totalMoradores', 'value':results.length}); 
      });
    };
    $scope.listaOperadoras = function(){
      $rootScope.request({url:'api/morador/lista_operadoras.php'}, function(operadoras){
        $scope.operadoras = operadoras;
      });
    };
    $scope.listaMoradores();
    $scope.listaOperadoras();
  }]);
})();