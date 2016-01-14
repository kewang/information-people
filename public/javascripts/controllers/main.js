angular.module('information-people-app', ["firebase"])
  .controller('InformationPeopleController', function() {
    var infoCtrl = this;
    var firebaseRef = new Firebase("https://information-people.firebaseio.com/");
  });
