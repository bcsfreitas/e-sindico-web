(function() {
  var app = angular.module('fotocam', []);
	app.directive('fotocam', function() {
      return {
        restrict: 'E',
        scope: {
      		ngModel:'=',
          pathSave:'=',
          pathView:'=',
          filename:'=',
          active:'@',
    	},
        require: 'ngModel',
        templateUrl: './modules/componentes/fotocam/fotocam.html',
        controller: 'fotocamCtrl'
      };
  });

  app.controller('fotocamCtrl', ['$scope', '$rootScope', '$http', '$timeout', function($scope, $rootScope, $http, $timeout){
    $scope.video = undefined;
    $scope.videoId = Math.random();
    $scope.active = ($scope.active) ? $scope.active : false;
    if(!$scope.filename){
      $scope.filename = 'imageupload';
    }
    // necessário para dar tempo de checar o ngModel e definir se chama ou não a camera
    $timeout(function(){
      if(!$scope.ngModel && $scope.active){
        $scope.setup();
      }else{
        $scope.currentImageView  = $scope.pathView + $scope.ngModel;
      }
    },500);

    $scope.activate = function(){
      $scope.active = true;
      $scope.setup();
    };
    $scope.setup = function() {
        navigator.myGetMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
        navigator.myGetMedia({ video: true }, $scope.connect, $scope.errorHandler);
    };   
    $scope.connect = function(stream) {
        $scope.video = document.getElementById("video_" + $scope.videoId);
        $scope.video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
        $scope.video.play();
    };
    $scope.getCanvas = function(){
      var canvas = document.getElementById('hiddenCanvas_' + $scope.videoId);
      if(canvas == null){
        var canvas = document.createElement('canvas');
        canvas.id = 'hiddenCanvas_' + $scope.videoId;
      }
      return canvas;
    };
    $scope.captureImage = function() {
      var canvas = $scope.getCanvas();
      document.getElementById('canvasHolder_' + $scope.videoId).appendChild(canvas);
      var ctx = canvas.getContext('2d');
      $scope.width = $scope.video.videoWidth;
      $scope.height = $scope.video.videoHeight;
      canvas.width = $scope.width;
      canvas.height = $scope.height;
      ctx.drawImage($scope.video, 0, 0, canvas.width, canvas.height);  
      $scope.binary = canvas.toDataURL();
      $scope.upload();
    };
    $scope.cancel = function(){
      $scope.deleteImageInServer($scope.pathSave + $scope.ngModel);
      $scope.ngModel = false;
      $scope.activate();
    };
    $scope.reload = function(){
      $scope.setup();
      $scope.error = false;
    };
    $scope.getNameFile = function(){
      return $scope.arquivo = $scope.filename + '_' + moment().format('DDMMYYYY_HHMMSS') + '.jpg';
    };
    $scope.deleteImageInServer = function(path){
      var data = {'path':path};
      $http({ withCredentials: false, method: 'post', url: 'api/utils/delete_image.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data:data}).success(function(data){
        if(data && data.success){
          $rootScope.$emit('toaster', {type:'success', title:'Exlusão da Imagem', text:data.success});
        }else{
          $rootScope.$emit('toaster', {type:'error', title:'Exlusão de Imagem', text:data.error});
        }
      });
    };
    $scope.upload = function(){
      var filename = $scope.getNameFile();
      var path = $scope.pathSave + filename;
      var data = {'path':path, 'base64':$scope.binary};
      $http({ withCredentials: false, method: 'post', url: 'api/utils/upload_image.php', 
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data:data}).success(function(data){
        if(data && data.success){
          $scope.currentImageView = $scope.pathView + filename;
          $scope.ngModel = filename;
          $rootScope.$emit('toaster', {type:'success', title:'Upload de Imagem', text:data.success});
        }else{
          $rootScope.$emit('toaster', {type:'errorHandlerror', title:'Upload de Imagem', text:data.error});
        }
      });
    };
    $scope.errorHandler = function(e) {
      $scope.$apply(function(){
        $scope.error = true;
      });
      args = {};
      args.type = "error";
      if (typeof e == 'string'){
        args.text = e;
      }else{
        console.log('fotocamError', e);
        args.text = String(e);
      }
      if(e && e.name && e.name=="PermissionDeniedError"){
        args.timeout = 8000;
        args.title = "Não foi possível acessar a câmera";
        args.text = "Tente desbloquear a câmera no canto direito da barra de endereço.";
      }
      $scope.errorVar = args;
      $rootScope.$emit('toaster', args);
    };

  }]);
  app.directive('fotoview', function() {
      return {
        restrict: 'E',
        scope: {
          ngModel:'=',
          pathView:'=',
          klass:'='
      },
        require: 'ngModel',
        templateUrl: './modules/componentes/fotocam/fotoview.html',
        controller: 'fotoviewCtrl'
      };
  });
  app.controller('fotoviewCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$modal', function($scope, $rootScope, $http, $timeout, $modal){
    
    $timeout(function(){
      $scope.setClass();
      if($scope.ngModel){
        $scope.verifyImage();
      }else{
        $scope.currentImageView = false;
      }
    });

    $scope.$watch('ngModel', function(n,o){
      if(o!==n){
        $scope.setClass();
        if($scope.ngModel){
          $scope.verifyImage();
        }else{
          $scope.currentImageView = false;
        }
      }
    });

    $scope.setClass = function(){
      if(!$scope.klass){
        $scope.class = "thumbnail";
      }else{
        $scope.class = $scope.klass;
      }
    };

    $scope.verifyImage = function(){
      var imgPath = $scope.ngModel;//$scope.pathView +'/'+ $scope.ngModel;
      $http({
          withCredentials:false, 
          method:'get', 
          url:imgPath, 
          cache:false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          $scope.currentImageView  = $scope.ngModel; //$scope.pathView + $scope.ngModel;
        }).error(function(error) {
          $scope.currentImageView = false;
        });
    };
    $scope.view = function(e){
        e.stopPropagation();

        var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'modalFotoView.html',
        controller: 'modalFotoViewCtrl',
        size: 'lg',
          resolve: {
            currentImageView: function () {
              return $scope.currentImageView;
            }
          }
      });
    };

  }]);
  app.controller('modalFotoViewCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$modalInstance', 'currentImageView', function($scope, $rootScope, $http, $timeout, $modalInstance, currentImageView){
    $rootScope.$on('ex9SessionExpired', function(e){
      $modalInstance.close();
    });
    $scope.close = function(){
      $modalInstance.close();
    };
    $scope.currentImageView = currentImageView;
  }]);
})();