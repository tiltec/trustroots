(function() {
  'use strict';

  /**
   * References-thread directive widget for asking feedback about the message thread
   *
   * Usage:
   *
   * ```
   * <div tr-reference-thread="userToId"></div>
   * ```
   *
   * userToId: feedback receiver's id
   */
  angular
    .module('references')
    .directive('trReferenceThread', trReferenceThreadDirective);

  /* @ngInject */
  function trReferenceThreadDirective() {
    var directive = {
      restrict: 'A',
      replace: true,
      templateUrl: '/modules/references/views/directives/tr-reference-thread.client.view.html',
      scope: {
        trReferenceThread: '='
      },
      controller: trReferenceThreadDirectiveController,
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

  // Note: Note that the directive's controller is outside the directive's closure.
  // This style eliminates issues where the injection gets created as unreachable code after a return.
  /* @ngInject */
  function trReferenceThreadDirectiveController($scope, messageCenterService, ReferenceThreadService) {

    // View Model
    /*jshint validthis: true */
    var vm = this;

    // Exposed to the view
    vm.userTo = vm.trReferenceThread;
    vm.createReference = createReference;
    vm.reference = false;
    vm.isLoading = true;
    vm.allowCreatingReference = false;

    activate();

    /**
     * Look for previous answers from the API
     */
    function activate() {
      ReferenceThreadService.get({
        userToId: vm.userTo
      }, function(referenceThread) {
        vm.isLoading = false;
        if(referenceThread) {
          vm.allowCreatingReference = true;
          vm.reference = referenceThread;
        }
      }, function(referenceThreadErr) {
        vm.isLoading = false;
        // In case of 404, API will tell us if we are allowed to send references to this user
        vm.allowCreatingReference = (referenceThreadErr.data && angular.isDefined(referenceThreadErr.data.allowCreatingReference)) ? referenceThreadErr.data.allowCreatingReference : false;
      });
    }

    /**
     * Send answer to the API
     */
    function createReference(reference) {
      var newReference = new ReferenceThreadService({
        userTo: vm.userTo,
        reference: reference
      });

      vm.reference = newReference;

      newReference.$save(function(response) {
        vm.reference = response;
        messageCenterService.add('success', 'Thank you!');
      }, function(err) {
        vm.reference = false;
        messageCenterService.add('danger', 'Something went wrong. Please try again.');
      });
    }

  }

})();