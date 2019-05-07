'use strict';

$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).find('svg').toggleClass('fa-angle-double-left fa-angle-double-right');    
    });
    $( window ).resize(function() {
        if($(window).width() > 769) 
            $('#sidebar').removeClass('active');
      });
});

var app = angular.module('customerApp', ['ngRoute']);

app.config( function($routeProvider) {
    $routeProvider
    
    .when("/detail/:name", {
        templateUrl: "center.html",
        controller: "searchController"
    })
});

app.service('custService', function($http, $q, $filter) {
    this.getCustomer = function (name) {
        
        var deferred = $q.defer();

        console.log('Inside customer detail get');
        
        $http.get('people.json').then(function(response) { 
            deferred.resolve( {data : $filter('filter')(response.data.People, function (d) {return d.name === name;})[0]} );
        }).catch(function(msg) { 
            deferred.reject(msg);
            console.log('error calling service' + msg);}
        );

        return deferred.promise;
    }

    this.getCustomers = function () {
        
        var deferred = $q.defer();

        console.log('Inside customers list get');
        
        $http.get('people.json').then(function(response) { 
            deferred.resolve( {data : response.data} );
        }).catch(function(msg) { 
            deferred.reject(msg);
            console.log('error calling service' + msg);}
        );

        return deferred.promise;
    }
});

app.controller('custController', function($scope, custService) {
    console.log('Inside controller');
    
    custService.getCustomers().then ( function(response) {
        console.log(response.data.People);
        $scope.customerlist = response.data.People; 
        location.href = "#detail/" + response.data.People[0].name;
    });
});

function searchController($scope, $routeParams, custService) {
    console.log('Inside search controller');
    
    custService.getCustomer($routeParams.name).then ( function(response) {
        console.log(response.data);
        $scope.customerdetail = response.data;
        console.log($scope.customerdetail);
        $scope.stars = [];
        $scope.max = 3;
        for (var i = 0; i < 5; i++) {
            $scope.stars.push({
                filled: i < $scope.customerdetail.rating
            });
        }
        
    });
}
app.controller('searchController', searchController);

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
  }]); 

var raghubannertemplate = `
<div class="row">
    <div class="col-xs-5 col-sm-6 col-lg-4">
        <img ng-src="{{customerdetail.img}}" class="img-responsive " />
        <ul class="list-inline">
                <li ng-repeat="star in stars" 
                    class="list-inline-item">
                        <i class="fa fa-heart" ng-show="customerdetail.rating > $index" style="color:#444;"></i>
                        <i class="fa fa-heart" ng-show="customerdetail.rating <= $index" style="color:#878685;"></i>
                </li>
                
        </ul>
    </div>
    <div class="col-xs-5 col-sm-6 col-lg-4">
        <p>{{customerdetail.Description}}</p>
    </div>
</div> `;


function raghubanner() {
    return {
        restrict: 'E',
        scope: {
            likes: "="
        },
        template: raghubannertemplate,
        controller: searchController,
        bindToController: true
    }
}
  
app.directive('raghubanner', raghubanner);

var raghulistemplate = `
<div class="table-responsive">          
<table class="table">
  <thead>
    <tr>
      <th>Likes</th>
      <th>Dislikes</th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="l in customerdetail.Likes">
      <td>{{l}}</td>
      <td>{{customerdetail.Dislikes[$index]}}</td>
    </tr>
  </tbody>
</table>
</div>`;

  
function raghulist() {
    return {
        restrict: 'E',
        scope: {
        },
        template: raghulistemplate,
        controller: searchController,
        bindToController: true
    }
}
  
app.directive('raghulist', raghulist);
