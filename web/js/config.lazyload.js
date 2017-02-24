// lazyload config

angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      easyPieChart:   [   'vendor/jquery.easy-pie-chart/dist/jquery.easypiechart.fill.js'],
      sparkline:      [   'vendor/jquery.sparkline/dist/jquery.sparkline.retina.js'],
      plot:           [   'vendor/flot/jquery.flot.js',
                          'vendor/flot/jquery.flot.pie.js', 
                          'vendor/flot/jquery.flot.resize.js',
                          'vendor/flot.tooltip/js/jquery.flot.tooltip.js',
                          'vendor/flot.orderbars/js/jquery.flot.orderBars.js',
                          'vendor/flot-spline/js/jquery.flot.spline.js'],
      moment:         [   'vendor/moment/moment.js'],
      screenfull:     [   'vendor/screenfull/dist/screenfull.min.js'],
      slimScroll:     [   'vendor/slimscroll/jquery.slimscroll.min.js'],
      sortable:       [   'vendor/html5sortable/jquery.sortable.js'],
      nestable:       [   'vendor/nestable/jquery.nestable.js',
                          'vendor/nestable/jquery.nestable.css'],
      filestyle:      [   'vendor/bootstrap-filestyle/src/bootstrap-filestyle.js'],
      slider:         [   'vendor/bootstrap-slider/bootstrap-slider.js',
                          'vendor/bootstrap-slider/bootstrap-slider.css'],
      chosen:         [   'vendor/chosen/chosen.jquery.min.js',
                          'vendor/bootstrap-chosen/bootstrap-chosen.css'],
      TouchSpin:      [   'vendor/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js',
                          'vendor/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
      wysiwyg:        [   'vendor/bootstrap-wysiwyg/bootstrap-wysiwyg.js',
                          'vendor/bootstrap-wysiwyg/external/jquery.hotkeys.js'],
      dataTable:      [   'vendor/datatables/media/js/jquery.dataTables.min.js',
                          'vendor/plugins/integration/bootstrap/3/dataTables.bootstrap.js',
                          'vendor/plugins/integration/bootstrap/3/dataTables.bootstrap.css'],
      vectorMap:      [   'vendor/bower-jvectormap/jquery-jvectormap-1.2.2.min.js', 
                          'vendor/bower-jvectormap/jquery-jvectormap-world-mill-en.js',
                          'vendor/bower-jvectormap/jquery-jvectormap-us-aea-en.js',
                          'vendor/bower-jvectormap/jquery-jvectormap-1.2.2.css'],
      footable:       [   'vendor/footable/dist/footable.all.min.js',
                          'vendor/footable/css/footable.core.css'],
      fullcalendar:   [   'vendor/moment/moment.js',
                          'vendor/fullcalendar/dist/fullcalendar.min.js',
                          'vendor/fullcalendar/dist/fullcalendar.css',
                          'vendor/fullcalendar/dist/fullcalendar.theme.css'],
      daterangepicker:[   'vendor/moment/moment.js',
                          'vendor/bootstrap-daterangepicker/daterangepicker.js',
                          'vendor/bootstrap-daterangepicker/daterangepicker-bs3.css'],
      tagsinput:      [   'vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
                          'vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.css']
                      
    }
  )
  // oclazyload config
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  true,
          events: true,
          modules: [
              {
                  name: 'ngGrid',
                  files: [
                      'vendor/ng-grid/build/ng-grid.min.js',
                      'vendor/ng-grid/ng-grid.min.css',
                      'vendor/ng-grid/ng-grid.bootstrap.css'
                  ]
              },
              {
                  name: 'ui.grid',
                  files: [
                      'vendor/angular-ui-grid/ui-grid.min.js',
                      'vendor/angular-ui-grid/ui-grid.min.css',
                      'vendor/angular-ui-grid/ui-grid.bootstrap.css'
                  ]
              },
              {
                  name: 'ui.select',
                  files: [
                      'vendor/angular-ui-select/dist/select.min.js',
                      'vendor/angular-ui-select/dist/select.min.css'
                  ]
              },
              {
                  name:'angularFileUpload',
                  files: [
                    'vendor/angular-file-upload/angular-file-upload.min.js'
                  ]
              },
              {
                  name:'ui.calendar',
                  files: ['vendor/angular-ui-calendar/src/calendar.js']
              },
              {
                  name: 'ngImgCrop',
                  files: [
                      'vendor/ngImgCrop/compile/minified/ng-img-crop.js',
                      'vendor/ngImgCrop/compile/minified/ng-img-crop.css'
                  ]
              },
              {
                  name: 'angularBootstrapNavTree',
                  files: [
                      'vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
                      'vendor/angular-bootstrap-nav-tree/dist/abn_tree.css'
                  ]
              },
              {
                  name: 'toaster',
                  files: [
                      'vendor/angularjs-toaster/toaster.js',
                      'vendor/angularjs-toaster/toaster.css'
                  ]
              },
              {
                  name: 'textAngular',
                  files: [
                      'vendor/textAngular/dist/textAngular-sanitize.min.js',
                      'vendor/textAngular/dist/textAngular.min.js'
                  ]
              },
              {
                  name: 'vr.directives.slider',
                  files: [
                      'vendor/venturocket-angular-slider/build/angular-slider.min.js',
                      'vendor/venturocket-angular-slider/build/angular-slider.css'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular',
                  files: [
                      'vendor/videogular/videogular.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.controls',
                  files: [
                      'vendor/videogular-controls/controls.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.buffering',
                  files: [
                      'vendor/videogular-buffering/buffering.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.overlayplay',
                  files: [
                      'vendor/videogular-overlay-play/overlay-play.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.poster',
                  files: [
                      'vendor/videogular-poster/poster.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.imaads',
                  files: [
                      'vendor/videogular-ima-ads/ima-ads.min.js'
                  ]
              },
              {
                  name: 'xeditable',
                  files: [
                      'vendor/angular-xeditable/dist/js/xeditable.min.js',
                      'vendor/angular-xeditable/dist/css/xeditable.css'
                  ]
              },
              {
                  name: 'smart-table',
                  files: [
                      'vendor/angular-smart-table/dist/smart-table.min.js'
                  ]
              }
          ]
      });
  }])
;

