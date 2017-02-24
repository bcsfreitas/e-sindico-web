'use strict';

/* Controllers */

angular.module('app')
  .controller('AppCtrl', ['$scope', '$rootScope', '$filter', '$translate', '$localStorage', '$window', '$http', '$interval', '$state', 'toaster', '$timeout',
    function(              $scope,   $rootScope, $filter,  $translate,   $localStorage,   $window, $http, $interval, $state, toaster, $timeout) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

      // config
      $rootScope.app = {
        name: 'eSindico',
        version: '1.0.0',
        lastUpdate:'11/01/2016',
        // for chart colors
        color: {
          primary: '#7266ba',
          info:    '#23b7e5',
          success: '#006A44',
          warning: '#fad733',
          danger:  '#f05050',
          light:   '#e8eff0',
          dark:    '#3a3f51',
          black:   '#1c2b36'
        },
        settings: {
          themeID: 11,
          navbarHeaderColor: 'bg-success',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-dark',
          headerFixed: false,
          asideFixed: false,
          asideFolded: true,
          asideDock: true,
          container: false
        }
      };

      // define um listner par ao toaster
      $rootScope.$on('toaster', function(e, args){
        var type = args.type || undefined;
        var title = args.title || undefined;
        var text = args.text || undefined;
        toaster.pop(type, title, text);       
      });

      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }

      if ( angular.isDefined($localStorage.user) ) {
        $scope.app.user = $localStorage.user;
      } else {
        $localStorage.user = $scope.app.user;
      }      

      //if(window.location.hostname == "localhost"){
      $rootScope.url = "http://10.0.1.53/esindico";
      //$rootScope.url = "http://localhost/esindico";
      //}else{
      //  $rootScope.url = "http://"+window.location.hostname+"/esindicoweb";
      //}

      $scope.$watch('app.settings', function(){
        // if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
        //   // aside dock and fixed must set the header fixed.
        //   $scope.app.settings.headerFixed = true;
        // }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
      }, true);

      $scope.$watch('app.user', function(){
        // if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
        //   // aside dock and fixed must set the header fixed.
        //   $scope.app.settings.headerFixed = true;
        // }
        // save to local storage
        $localStorage.user = $scope.app.user;
      }, true);      

      // angular translate
      $scope.lang = { isopen: false };
      $scope.langs = {pt_BR:'Português do Brasil', en:'English', de_DE:'German', it_IT:'Italian'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "Português do Brasil";
      $scope.setLang = function(langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      $scope.app.settings.navbarHeaderColor='bg-info dker'; 
      $scope.app.settings.navbarCollapseColor='bg-info dker'; 
      $scope.app.settings.asideColor='bg-light dker b-r';    

      function isSmartDevice( $window ){
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

      

      // Verifica a sessao a cada 31 minutos, ela expira em 30 em casos de ociosidade
      /*$interval(function(){
        $rootScope.request({url:'api/utils/session.php', data:{check:1}, nomessage:true}, function(response){
          if(response && response.code == 1500){
            console.info("Redicionamento automático por sessão expirada...")
            $state.go('acesso.signin', {'errorCode':1500})
          }
        });
      }, 90000);*/

      $scope.logout = function(){
        $rootScope.request({method:'post', url:'/person/logout'}, function(request){
          if(request && request.message){
            $timeout(function(){
              $rootScope.$emit('toaster', {title:"Informação de Logout", text:"Até a próxima", type:'success'});  
            }, 1000);            
            $state.go('acesso.signin', {'errorCode':1});
          }
        }, function(){
          $state.go('acesso.signin', {'errorCode':2});
        });
      };

      $scope.datenow = function(){
        return moment().locale('pt-br').format('DD [de] MMMM [de] YYYY [às] MM:HH:mm');
      };

      $rootScope.fromNow = function(input, format){
        return moment(String(input), format).locale('pt-br').fromNow();
      };

      //metodo de request
      $rootScope.request = function(param, callSuccess, callError){
        if(!param)
          throw "$rootScope.request: param is required";
        if(typeof param != 'object'){
          throw "$rootScope.request: request method param is not object";
        }
        var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        
        headers['x-platform'] = 'web';
        if($rootScope.token){
          headers['x-token'] = $rootScope.token;
        }else if($localStorage.token){
          headers['x-token'] = $localStorage.token;
        }

        var method;
        if(param.method){
          method = param.method;
        }else{
          method = "post";
        }

        $http({
          withCredentials:false, 
          method:method, 
          url: $rootScope.url + param.url, 
          cache:false,
          headers: headers, 
          data:param.data
        }).success(function(data, code){
          if(typeof data == 'string'){
              if(!param.nomessage){
                if(data && data.message){
                  $rootScope.$emit('toaster', {type:'error', title:"Informação", text:data.message});
                }else{
                  $rootScope.$emit('toaster', {type:'error', title:"Informação", text:data});
                }
              }
          }else{
            callSuccess(data, code);
          }
        }).error(function(error, code) {
          if(callError){
            callError(error, code);
          }else{
            var message =  (typeof error == 'string') ? error : String(error);
            if(!param.nomessage){
              if(error && error.message){
                $rootScope.$emit('toaster', {type:'error', title:'Informações do Erro', text: error.message});
              }else if(code==0){
                $rootScope.$emit('toaster', {type:'error', title:'Informações do Erro', text: "Erro interno de rede"});
              }
            }
          }
        });
      };
      

      $rootScope.onlyNumbers = /^\d+$/;
  }]);

  app.factory('focus', function($timeout, $window) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };
  });
  
  // app.config(['$httpProvider', function ($httpProvider) {
  //   $httpProvider.interceptors.push('httpResponseInterceptor');
  // }]);
  
  // app.factory('httpResponseInterceptor', ['$q', '$location', function($q, $location){
  //   return {
  //     response:function(response){
  //       if(response && response.data && response.data.code && response.data.code == 1500){
  //         console.info("Redicionamento automático por sessão expirada.")
  //         $location.path('/acesso/signin/1500');
  //       }
  //       return response;
  //     }
  //   };
  // }]);



app.service('fileUpload', ['$http', '$log', '$rootScope', '$localStorage', function ($http, $log, $rootScope, $localStorage) {
    this.uploadFileToUrl = function(file, uploadUrl, requestCode, call, headerParams){
        var fd = new FormData();
        var token = $localStorage.token;
        var defaultParams = {'X-token':token, 'Content-Type': undefined};
        var headerParams = angular.extend(defaultParams, headerParams);
        fd.append("image", file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: headerParams
        })
        .success(function(response, code){
          $rootScope.$emit('uploadService', response, code, false, requestCode, call);
        })
        .error(function(response, code){
          $rootScope.$emit('uploadService', response, code, true, requestCode, call);
        });
    }
}]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.filter('dateFormat', function(){
    var date = "";
    return function(input, formatFrom, formatTo){
      if( input instanceof Date && formatFrom === false && typeof formatTo == "string"){
        date = moment(input).locale('pt-br').format(formatTo);
      }else if( typeof input == "string" && typeof formatFrom == "string" && formatTo === "date" ){
        date = moment(input, formatFrom).toDate();
      }else if( typeof input == "string" && typeof formatFrom == "string" && typeof formatTo == "string" ){
        date = moment(input, formatFrom).locale('pt-br').format(formatTo);
      }
      return date;
    };
});

app.filter('status', function(){

    // D - Pendente de Avaliação, 
    // C - Cadastro Reprovado, 
    // P - Publicado, 
    // D - Publicado e Destacado
    // R - Retirado.

    var status = "";
    return function(input){
      switch (input) {
        case "A":
          status = "Pendente de Avaliação";
          break;
        case "C":
          status = "Cadastro Reprovado";
          break;
        case "P":
          status = "Publicado";
          break;          
        case "R":
          status = "Retirado";  
          break;
        default:
          status = input;
          break;
      }
      return status;
    };
});

app.filter('range', function ($parse) {
    return function(input, total){
      total = parseInt(total);
      for(var i=1; i<=total; i++){
        input.push(i)
      }
      return input;
    };
});

app.filter('telefone', function(){
    return function(input){
      return String(input).replace(/(\d{2})(\d{4})(\d)/,"($1) $2-$3");
    };
});

app.filter('cep', function(){
    return function(input){
      return String(input).replace(/(\d{5})(\d)/,"$3-$4");
    };
});

app.filter('cpf', function(){
    return function(input){
      return String(input).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");
    };
});

app.filter('fromNow', function(){
    return function(input, format){
      return moment(String(input), format).locale('pt-br').fromNow();
    };
});

app.filter('filesize', function(){
    return function (size) {
      if (isNaN(size))
        size = 0;
      if (size < 1024)
        return size + ' Bytes';
      size /= 1024;
      if (size < 1024)
        return size.toFixed(2) + ' KB';
      size /= 1024;
      if (size < 1024)
        return size.toFixed(2) + ' MB';
      size /= 1024;
      if (size < 1024)
        return size.toFixed(2) + ' GB';
      size /= 1024;
      return size.toFixed(2) + ' TB';
    };
});