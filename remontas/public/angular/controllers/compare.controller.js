remontas24Site.controller('compareController', ['$scope', 'Session', 'compareService', '$sce', function($scope, Session, compareService, $sce) {

    $scope.model = {}

    $scope.showPhone = showPhone;
    $scope.prepareHTML = prepareHTML;
    $scope.showPrice = showPrice;
    $scope.checkJob = checkJob;
    $scope.checkedJob = checkedJob;

    compareService.compare({
        "masters": Session.favourites()
    }, function(data) {
        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
        $scope.model.masters = JSON.parse(JSON.stringify(data.masters));
        $scope.model.categories = JSON.parse(JSON.stringify(data.categories));
        $scope.model.checked = "";


        Session.clearFavorites();
        $scope.model.masters.forEach(function(element) {
            Session.addToFavourites(element._id)
        }, this);

    })

    function showPhone(phone) {
        if (phone != "") {
            return "+7 (" + phone.substr(0, 3) + ") " + phone.substr(3, 3) + " " + phone.substr(6, 2) + " " + phone.substr(8, 2);
        }
        return phone;
    }

    function showPrice(category, index, master) {
        if (master.prices[category._id] != undefined) return master.prices[category._id] + "<span>" + category.measure + "</span>";
        return "-----";
    }

    function prepareHTML(element) {
        return $sce.trustAsHtml(element);
    };

    function checkJob(event) {
        //        console.log(event.target.attributes['data-param'].value)
        $scope.model.checked = event.target.attributes['data-param'].value;
    }

    function checkedJob(event) {
        return $scope.model.checked == event;
    }
}]);