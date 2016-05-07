<!DOCTYPE html>
<html lang="ru">

<head>
    <base href="/">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <title>Админка Ремонтас24</title>

    <!-- Bootstrap core CSS -->
    <link href="adminka/public/css/bootstrap.min.css" rel="stylesheet">

    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
    <link href="adminka/public/css/ie10-viewport-bug-workaround.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="adminka/public/css/signin.css" rel="stylesheet">

    <!-- Custom Fonts -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

    <!-- MetisMenu CSS -->
    <link href="/adminka/public/css/metisMenu.min.css" rel="stylesheet">

    <!-- Timeline CSS -->
    <link href="/adminka/public/css/timeline.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link href="/adminka/public/css/sb-admin-2.css" rel="stylesheet">

    <!-- Morris Charts CSS -->
    <link href="/adminka/public/css/morris.css" rel="stylesheet">

    <link href="adminka/public/bower_components/ui-select/dist/select.css" rel="stylesheet">



    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    <script src="/adminka/public/bower_components/angular/angular.min.js"></script>
    <script src="/adminka/public/bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>
    <script src="/adminka/public/bower_components/ngstorage/ngStorage.min.js"></script>
    <script src="/adminka/public/bower_components/angular-resource/angular-resource.min.js"></script>
    <script src="/adminka/public/bower_components/ng-file-upload/ng-file-upload-all.min.js"></script>
    <script src="/adminka/public/bower_components/angular-ui-mask/dist/mask.js"></script>
    <script src="/adminka/public/bower_components/angular-sanitize/angular-sanitize.js"></script>
    <script src="/adminka/public/bower_components/ui-select/dist/select.js"></script>

</head>

<body ng-app="remontas24App">

    <div ng-controller="mainController">
        <div ui-view></div>
    </div>


    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
    <script src="adminka/public/js/ie10-viewport-bug-workaround.js"></script>

    <!-- Angular Modules -->
    <script src="/adminka/public/app/remontas24App.js"></script>

    <!-- Angular Controllers -->
    <script src="/adminka/public/app/controllers/mainController.js"></script>
    <script src="/adminka/public/app/controllers/adminkaMainPageController.js"></script>
    <script src="/adminka/public/app/controllers/mastersController.js"></script>
    <script src="/adminka/public/app/controllers/masterController.js"></script>
    <script src="/adminka/public/app/controllers/categoriesController.js"></script>
    <script src="/adminka/public/app/controllers/category.controller.js"></script>
    <script src="/adminka/public/app/controllers/usersMasters.controller.js"></script>

    <!--  Angular services  -->
    <script src="/adminka/public/app/services/AuthServices.js"></script>
    <script src="/adminka/public/app/backend.js"></script>


    <!-- Доп скрипиты для админки -->
    <script src="/adminka/public/js/jquery-2.1.4.min.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="/adminka/public/js/bootstrap.min.js"></script>

    <!-- Metis Menu Plugin JavaScript -->
    <script src="/adminka/public/js/metisMenu.min.js"></script>

    <!-- Morris Charts JavaScript -->
    <script src="/adminka/public/js/raphael-min.js"></script>
    <script src="/adminka/public/js/morris.min.js"></script>

    <!-- Custom Theme JavaScript -->
    <script src="/adminka/public/js/sb-admin-2.js"></script>

</body>

</html>
