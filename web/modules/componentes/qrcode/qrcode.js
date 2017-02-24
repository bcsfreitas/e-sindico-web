(function() {
    var app = angular.module('qrcodereader', []);
    
    app.directive('qrcodeReader', function() {
      return {
        restrict: 'E',
        scope: {
            ngModel:'=',
            show:'=',
            call:'&',
        },
        require: 'ngModel',
        template: '<video class="col-xs-12" id="v" autoplay></video> <canvas id="qr-canvas" width="300" height="400" style="display:none;"></canvas>',
        controller: 'qrcodeReaderCtrl'
      };
    });
    app.controller('qrcodeReaderCtrl', ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
        $scope.gCtx = null; 
        $scope.gCanvas = null;
        $scope.video = document.getElementById("v");
        $scope.initCanvas = function(w,h){
            $scope.gCanvas = document.getElementById('qr-canvas');
            if($scope.gCanvas == null){
              $scope.gCanvas = document.createElement('canvas');
              $scope.gCanvas.id = 'qr-canvas';
            }
            $scope.gCanvas.style.width = w + "px";
            $scope.gCanvas.style.height = h + "px";
            $scope.gCanvas.width = w;
            $scope.gCanvas.height = h;
            $scope.gCtx = $scope.gCanvas.getContext("2d");
            $scope.gCtx.clearRect(0, 0, w, h);
            $scope.gCanvas.src = $scope.gCanvas.toDataURL();
        }
        $scope.captureToCanvas = function() {
            $scope.gCtx.drawImage($scope.video,0,0);
            try{
                qrcode.decode();
            }catch(e){
                $timeout($scope.captureToCanvas, 500);
            };
        }
        $scope.read = function(reader){
          $scope.ngModel = reader;
          $scope.call({'reader':reader});
        } 
        $scope.isCanvasSupported = function(){
          var elem = document.createElement('canvas');
          return !!(elem.getContext && elem.getContext('2d'));
        }
        $scope.success = function(stream) {
            $scope.video = document.getElementById("v");
            $scope.video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
            $scope.video.play();
            $timeout($scope.captureToCanvas, 500);
        }
        $scope.error = function(error) {
            return;
        }
        $scope.init = function(){
          if($scope.isCanvasSupported() && window.File && window.FileReader){
            $scope.initCanvas(800, 600);
            qrcode.callback = $scope.read;
            $scope.setwebcam();
          }else{
            $rootScope.$emit('toaster', {title:"Erro ao ler camera", type:"error", text:"Erro ao tentar acessar a camera."});
          }
        }
        $scope.setwebcam = function(){
            navigator.myGetMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
            navigator.myGetMedia({video:true}, $scope.success, $scope.error);
            $timeout($scope.captureToCanvas, 500);
        }
        $scope.$watch('show', function(n,o){
            if(o!==n){
                if(n){
                    $scope.init();
                }
            }
        });
        if($scope.show == undefined){
            $scope.init();
        }
        
    }]);
    app.directive('qrcodeWhrite', function() {
      return {
        restrict: 'E',
        scope: {
            ngModel:'=',
        },
        require: 'ngModel',
        template: '<div id="qrcodeWhrite"></div>',
        controller: 'qrcodeWhriteCtrl'
      };
    });
    app.controller('qrcodeWhriteCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.id = Math.random();
        var qrcode = new QRCode("qrcodeWhrite");
        $scope.makeCode =function() { 
            if($scope.ngModel) 
            qrcode.makeCode($scope.ngModel);
        }
        $scope.$watch('ngModel', function(o,n){
            if(o!=n){
                $scope.makeCode();
            }
        })
        $scope.makeCode();
    }]);

})();