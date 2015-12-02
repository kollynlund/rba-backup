(function(app){
  // ROUTES
  function routes($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'templates/home.html',
        controller: 'HomeController as hc'
      })

      .state('about', {
        url: '/about',
        templateUrl: 'templates/about.html'
      })

      .state('apply', {
        url: '/apply',
        templateUrl: 'templates/apply.html',
        controller: 'ApplyController as apc'
      })

      .state('contact', {
        url: '/contact',
        templateUrl: 'templates/contact.html',
        controller: 'ContactController as cc'
      })

      .state('courses', {
        url: '/courses',
        templateUrl: 'templates/courses.html'
      })

      .state('faculty', {
        url: '/faculty',
        templateUrl: 'templates/faculty.html',
        controller: 'FacultyController as fc'
      })

      .state('faq', {
        url: '/faq',
        templateUrl: 'templates/faq.html'
      })

      .state('newsletter', {
        url: '/newsletter',
        templateUrl: 'templates/newsletter.html'
      })

      .state('philosophy', {
        url: '/philosophy',
        templateUrl: 'templates/philosophy.html'
      });
  };

  // CUSTOM DIRECTIVES
  function bindVideoSize($window, $timeout, VideoSize) {
    return {
      restrict: 'A',
      replace: false,
      link: function(scope, element) {
        function bindSize() {
          scope.$apply(function() {
            VideoSize.dimensions.width = element[0].clientWidth;
            VideoSize.dimensions.height = element[0].clientHeight;
          });
        };
        $window.onresize = bindSize;
        // Allow current digest loop to finish before setting VideoSize
        $timeout(bindSize, 0);
      }
    };
  };

  // CONTROLLERS
  function HomeController($state, VideoSize) {
    var hc = this;
    hc.dimensions = VideoSize.dimensions;
    hc.goToAbout = function() {
      $state.go('about');
    }
  };
  function ApplyController($scope, $modal, DataTransfer) {
    var apc = this;
    apc.application = {};
    apc.stupidIdiot = true;
    apc.completed = false;

    $scope.$watchCollection(watchApplication, handleAppicationChange);
    function watchApplication() {
      return [
        apc.application.first_name,
        apc.application.preferred_name,
        apc.application.native_language,
        apc.application.other_languages,
        apc.application.family_surname,
        apc.application.date_of_birth,
        apc.application.how_did_you_hear_about_us,
        apc.application.gender,
        apc.application.street_address,
        apc.application.state_province,
        apc.application.postal_code,
        apc.application.telephone_number,
        apc.application.city,
        apc.application.country,
        apc.application.email,
        apc.application.application_year,
        apc.application.level_of_education
      ]
    };
    function handleAppicationChange(newVals, oldVals) {
      if (
        newVals[0] &&
        newVals[1] &&
        newVals[2] &&
        newVals[3] &&
        newVals[4] &&
        newVals[5] &&
        newVals[6] &&
        newVals[7] != 'Gender*' &&
        newVals[8] &&
        newVals[9] &&
        newVals[10] &&
        newVals[11] &&
        newVals[12] &&
        newVals[13] &&
        newVals[14] &&
        newVals[15] != 'Year for which you are applying*' &&
        newVals[16] != 'Highest Level of Education*'
      ) {
        apc.stupidIdiot = false;
      }
      else {
        apc.stupidIdiot = true;
      }
    };

    apc.openInfoModal = function (infoSubject) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'Application File Info Modals/'+infoSubject+'.html',
        controller: 'GenericModalController as amc',
        size: 'lg'
      });
    };

    apc.submitForm = function() {
      DataTransfer.SendApplication(apc.application);
      // DataTransfer.SendApplicationEmail();
      apc.completed = true;
      $modal.open({
        animation: true,
        templateUrl: 'templates/application-submitted-modal.html',
        controller: 'GenericModalController as mc',
        size: 'lg'
      });
    };
  };
  function ContactController($scope, DataTransfer) {
    var cc = this;
    cc.formValid = false;
    cc.emailSent = false;
    cc.formData = {
      name:'',
      email:'',
      phone:'',
      message:''
    };

    function watchFormData() {
      return [cc.formData.name, cc.formData.email]
    };
    function handleFormDataChange() {
      if (cc.formData.name && emailRegex.test(cc.formData.email)) {
        cc.formValid = true;
      } else {
        cc.formValid = false;
      }
    };
    $scope.$watchCollection(watchFormData,handleFormDataChange);

    cc.submitForm = function() {
      if (cc.formValid) {
        DataTransfer.SendContactEmail(cc.formData);
        cc.emailSent = true;
      }
    };
  };
  function FacultyController($modal) {
    var fmc = this;
    fmc.open = function (facultyMemberName) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'Faculty Member Profiles/'+facultyMemberName+'.html',
        controller: 'GenericModalController as fmc',
        size: 'lg'
      });
    };
  };
  function GenericModalController($modalInstance) {
    this.close = function () {
      $modalInstance.close();
    };
  };
  function HeaderController($scope,$state,$window) {
    $scope.windowWidth = $window.innerWidth;
    $scope.showMenu = false;
    // Watch for changes in the window width
    $(window).on("resize.doResize", function (){
      $scope.$apply(function(){
        $scope.showMenu = false;
        $scope.windowWidth = $window.innerWidth;
      });
    });
    $scope.$on("$destroy",function (){
      // Kill resize listener
       $(window).off("resize.doResize");
    });
    // -------------------------------------

    this.goTo = function(pagename) {
      $state.go(pagename);
      $scope.showMenu = false;
    }
  };
  function FooterController() {
    this.currentYear = new Date().getFullYear();
  };

  // SERVICES
  function VideoSize($interval) {
    var dimensions = {
      'width': null,
      'height': null
    };

    return {
      'dimensions': dimensions
    };
  };
  function DataTransfer($http) {
    return {
      SendContactEmail: function(the_data) {
        return $http({
          method: 'POST',
          url: 'https://mandrillapp.com/api/1.0/messages/send.json',
          headers: {
            'Content-Type':'application/json'
          },
          data: {
            "key":"h_FdIHNlZN0YdLY8vU8Cfg",
            "message": {
              "text": 'Name: '+the_data.name+'\nEmail Address: '+the_data.email+'\nPhone Number: '+the_data.phone+'\nMessage: '+the_data.message,
              "subject": "You have a new message for the RBA site.",
              "from_email": "signupforroyalbusinessacademy@gmail.com",
              "from_name": "New Message from RBA site",
              "to": [
                {
                  "email": "spencer@royalbusinessacademy.org ",
                  "name": "Spencer Rogers",
                  "type": "to"
                }
              ]
            }
          }
        });
      },
      SendApplicationEmail: function() {
        return $http({
          method: 'POST',
          url: 'https://mandrillapp.com/api/1.0/messages/send.json',
          headers: {
            'Content-Type':'application/json'
          },
          data: {
            "key":"h_FdIHNlZN0YdLY8vU8Cfg",
            "message": {
              "text": 'You just had a new student apply for Royal Business Academy!',
              "subject": "New RBA Applicant",
              "from_email": "signupforroyalbusinessacademy@gmail.com",
              "from_name": "New Message from RBA site",
              "to": [
                {
                  "email": "spencer@royalbusinessacademy.org ",
                  "name": "Spencer Rogers",
                  "type": "to"
                }
              ]
            }
          }
        });
      },
      SendApplication: function(the_data) {
        return $http({
          method: 'POST',
          // url: 'https://docs.google.com/forms/d/1hn7YvTiMZZhA3FEm7-UHagXZDvifUx5VbLdRgz37_nE/formResponse',
          url: 'https://script.google.com/macros/s/AKfycbx6ODpNDuVLEbBSr7B9EOiU7rbRRcYtSGwllnVNVMcMEoStPwM/exec',
          headers: {
            'Content-Type':'application/x-www-form-urlencoded'
          },
          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },
          data: {
            'Timestamp': 'placeholder',
            'First Name': the_data.first_name || '',
            'Last Name': the_data.family_surname || '',
            'Preferred Name': the_data.preferred_name || '',
            'Date of Birth': the_data.date_of_birth || '',
            'Native Language': the_data.native_language || '',
            'How did you hear about us?': the_data.how_did_you_hear_about_us || '',
            'Other Language(s)': the_data.other_languages || '',
            'Gender': the_data.gender || '',
            'Street Address': the_data.street_address || '',
            'City': the_data.city || '',
            'State or Province': the_data.state_province || '',
            'Country': the_data.country || '',
            'Postal Code': the_data.postal_code || '',
            'Email': the_data.email || '',
            'Telephone Number': the_data.telephone_number || '',
            'Year for which you are applying': the_data.application_year || '',
            'Highest Level of Education': the_data.level_of_education || ''
          }
        });
      }
    }
  };

  // RANDOM GLOBAL UTILITIES
  var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  app
  .config(routes)
  .directive('bindVideoSize',bindVideoSize)
  .controller('HomeController', HomeController)
  .controller('ApplyController', ApplyController)
  .controller('ContactController', ContactController)
  .controller('FacultyController', FacultyController)
  .controller('GenericModalController', GenericModalController)
  .controller('HeaderController', HeaderController)
  .controller('FooterController', FooterController)
  .factory('VideoSize', VideoSize)
  .factory('DataTransfer', DataTransfer)
})(angular.module('rba',['ui.router','ui.bootstrap','ngAnimate']));