/**
 *  Use aysnc script loader, configure the application module (for AngularJS)
 *  and initialize the application ( which configures routing )
 *
 *  @author Thomas Burleson
 */

(function( head ) {
    "use strict";

    var app;

    head.js(

          { jquery       : "./vendor/jquery/jquery.min.js"                   }
        , { angular      : "./vendor/angular/angular.js"                     }
        , { ngSanitize   : "./vendor/angular-sanitize/angular-sanitize.js"   }
        , { uiRoute      : "./vendor/angular-ui-router/release/angular-ui-router.js" }
        , { uibootstrap  : "./vendor/angular-bootstrap/ui-bootstrap-tpls.js" }

        , { toastr       : "./vendor/toastr/toastr.js"                       }

        , { breeze_debug : "./src/breeze/breeze.debug.js"                    }
        , { breeze_ng    : "./src/breeze/breeze.angular.js"                  }
        , { breeze_mongo : "./src/breeze/breeze.dataservice.mongo.js"        }
        , { breeze_metah : "./src/breeze/breeze.metadata-helper.js"          }

    )
    .ready("ALL", function() {

        app = angular.module( "app", [ 'breeze.angular', 'ui.router', 'ui.bootstrap' ] )

        head.js(

              "./src/app/config/environment.js"
            , "./src/app/config/configuration.js"

            , "./src/app/controllers/session.js"
            , "./src/app/controllers/header.js"
            , "./src/app/controllers/order.js"
            , "./src/app/controllers/orderSidebar.js"
            , "./src/app/controllers/orderItem.js"
            , "./src/app/controllers/orderMenu.js"
            , "./src/app/controllers/cart.js"

            , "./src/app/directives/appVersion.js"
            , "./src/app/directives/productSrc.js"
            , "./src/app/filters/toTitle.js"
            , "./src/app/services/util.js"
            , "./src/app/services/logger.js"
            , "./src/app/services/dataservice.js"
            , "./src/app/services/databaseReset.js"
            , "./src/app/services/dataservice.js"
            , "./src/app/services/entityManagerFactory.js"
            , "./src/app/services/metadata.js"
            , "./src/app/services/model.js"
            , "./src/app/services/pricing.js"

            // UI-routing configurations

            , "./src/app/routes/routeMap.js"
            , "./src/app/routes/routeStates.js"

        )
        .ready("ALL", function()
        {
             app.run( function configureToastr( util )
             {
                 // Configure toastr for this app
                 // 2 second toast timeout

                 toastr.options.timeOut       = 2000;
                 toastr.options.positionClass = 'toast-bottom-right';

                 util.logger.info( "Zza SPA is loaded and running on " + util.config.server );
             });
        });



    });


}( window.head ));
