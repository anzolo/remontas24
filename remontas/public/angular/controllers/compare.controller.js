remontas24Site.controller('compareController', ['$scope', 'Session', 'compareService', '$sce', function ($scope, Session, compareService, $sce) {

    $scope.model = {}

    $scope.showPhone = showPhone;
    $scope.prepareHTML = prepareHTML;
    $scope.showPrice = showPrice;
    $scope.showServiceText = showServiceText;
    $scope.showAveragePrice = showAveragePrice;

    compareService.compare({
        "masters": Session.favourites()
    }, function (data) {
        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
        $scope.model.masters = JSON.parse(JSON.stringify(data.masters));
        $scope.model.categories = JSON.parse(JSON.stringify(data.categories));
        $scope.model.averagePrices = JSON.parse(JSON.stringify(data.averagePrices.prices));
        shrinkServiceText();
        $scope.model.checked = "";
        $scope.model.mouseOver = "";

        Session.clearFavorites();
        $scope.model.masters.forEach(function (element) {
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

    function showAveragePrice(category) {
        if ($scope.model.averagePrices[category._id] != undefined) return $scope.model.averagePrices[category._id] + "<span>" + category.measure + "</span>";
        return "";
    }

    function prepareHTML(element) {
        return $sce.trustAsHtml(element);
    };

    function shrinkServiceText() {
        $scope.model.categories.forEach(function (service, i, arr) {
            if (service.type == 'job') {
                if (service.name.length > 67) service.shortName = service.name.substring(0, 66) + "..."
            }
        });
    };

    function showServiceText(service) {
        if ($scope.model.mouseOver == service._id) return service.name

        if (service.shortName == undefined) return service.name
        else return service.shortName

    }
}]);