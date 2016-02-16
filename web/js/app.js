var app = angular.module('app', ['ui.sortable']);
app.directive('datepicker',function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            element.datepicker({
                dateFormat: 'mm/dd/yy',
                constrainInput: true,
                onSelect: function (date) {
                    scope.date = date;
                    scope.$apply();
                }

            });
        }
    }});
app.controller('ImageController', ImageController);

jQuery(window).scroll(function() {
    if (jQuery(this).scrollTop() > 87) {
        jQuery(".top-bar").css({"position": "fixed", "top": 0});
    } else {
        jQuery(".top-bar").removeAttr("style");
    }
});



