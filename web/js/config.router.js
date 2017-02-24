'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 
      function ($stateProvider,   $urlRouterProvider, JQ_CONFIG) {
          
          $urlRouterProvider.otherwise('/acesso/signin/1');

          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'tpl/app.html'
              })
              .state('app.login', {
                  url: '/login',
                  templateUrl: 'modules/usuario/postFormCtrl.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/usuario/usuario.js']);
                    }]
                  }
              })
              .state('app.fornecedor', {
                  url: '/fornecedor',
                  templateUrl: 'modules/fornecedor/form.html',
                  controller: 'fornecedorFormCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/fornecedor/fornecedor.js']);
                    }]
                  }
              })
              .state('app.grafico', {
                  url: '/grafico',
                  templateUrl: 'modules/grafico/form.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/grafico/grafico.js']);
                    }]
                  }
              })      

              .state('app.user', {
                  url: '/user',
                  templateUrl: 'modules/user/list.html',
                  controller: 'userListCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/user/user.js']);
                    }]
                  }
              })

              .state('app.userform', {
                  url: '/form/:id?',
                  templateUrl: 'modules/user/form.html',
                  controller: 'userFormCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/user/user.js']);
                    }]
                  }
              })
          
              .state('app.cadastros', {
                  url: '/cadastros',
                  templateUrl: 'modules/cadastros/list.html',
                  controller: 'cadastrosCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/cadastros/cadastros.js']);
                    }]
                  }
              })

              .state('app.cadastrosform', {
                  url: '/cadastrosform/:id?',
                  templateUrl: 'modules/cadastros/form.html',
                  controller: 'cadastrosFormCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/cadastros/cadastros.js']);
                    }]
                  }
              })


              .state('app.categorias', {
                  url: '/categorias',
                  templateUrl: 'modules/categorias/form.html',
                  controller: 'categoriasFormCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/categorias/categorias.js']);
                    }]
                  }
              })

              .state('app.subcategoria', {
                  url: '/subcategorias',
                  templateUrl: 'modules/categorias/subs.html',
                  controller: 'subFormCtrl',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/categorias/categorias.js']);
                    }]
                  }
              })   

              .state('app.avaliacoes', {
                  url: '/avaliacoes',
                  templateUrl: 'modules/avaliacoes/form.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/avaliacoes/avaliacoes.js']);
                    }]
                  }
              })           

              .state('app.propaganda', {
                  url: '/propagandas',
                  templateUrl: 'modules/propaganda/form.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['modules/propaganda/propaganda.js']);
                    }]
                  }
              })      

              .state('lockme', {
                  url: '/lockme',
                  templateUrl: 'modules/acesso/lockme.html'
              })
              .state('acesso', {
                  url: '/acesso',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              .state('acesso.signin', {
                  url: '/signin/:errorCode?',
                  templateUrl: 'modules/acesso/signin.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['modules/acesso/acesso.js'] );
                      }]
                  }
              })
              .state('acesso.signup', {
                  url: '/signup/:errorCode?',
                  templateUrl: 'modules/acesso/signup.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['modules/acesso/acesso.js'] );
                      }]
                  }
              })
      }
    ]
  );
