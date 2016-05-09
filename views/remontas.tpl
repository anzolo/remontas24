<!DOCTYPE html>
<html lang="en">

<head>
    <base href="/">
    <meta charset="UTF-8">
    <title>Ремонтас 24 - Мастер найдется!</title>
    <link type="text/css" rel="stylesheet" href="/remontas/public/css/normalize.css">
    <link rel="stylesheet" type="text/css" href="/remontas/public/css/custom.css">
    <link rel="stylesheet" href="/remontas/public/js/fancybox/source/jquery.fancybox.css?v=2.1.5" type="text/css" media="screen" />

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

    <link rel="stylesheet" type="text/css" href="/remontas/public/css/test.css">

    <link href='https://fonts.googleapis.com/css?family=Roboto:400,300&subset=latin,cyrillic' rel='stylesheet' type='text/css'>
    <link rel="shortcut icon" href="/remontas/public/favicon.ico" />
    <meta name="viewport" content="width=1250">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->

    <script src="/remontas/public/bower_components/es6-shim/es6-shim.min.js"></script>
    <script src="/remontas/public/bower_components/angular/angular.js"></script>
    <script src="/remontas/public/bower_components/ngstorage/ngStorage.min.js"></script>
    <script src="/remontas/public/bower_components/angular-resource/angular-resource.min.js"></script>
    <script src="/remontas/public/bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>
    <script src="/remontas/public/bower_components/angular-modal-service/dst/angular-modal-service.js"></script>
    <script src="/remontas/public/bower_components/angular-ui-mask/dist/mask.js"></script>
    <script src="/remontas/public/bower_components/angular-sanitize/angular-sanitize.js"></script>
    <script src="/remontas/public/bower_components/ng-file-upload/ng-file-upload-all.js"></script>

</head>

<body ng-app="remontas24Site">
    <div ui-view></div>

    <!--    <script type="text/javascript" src="/remontas/public/js/custom.js"></script>-->

    <!-- Модули -->
    <script src="/remontas/public/angular/remontas24Site.js"></script>

    <!-- Контроллеры -->
    <script src="/remontas/public/angular/controllers/mainWindow.controller.js"></script>
    <script src="/remontas/public/angular/controllers/authRegForm.controller.js"></script>
    <script src="/remontas/public/angular/controllers/lk.controller.js"></script>
    <script src="/remontas/public/angular/controllers/changeAvatarModal.controller.js"></script>
    <script src="/remontas/public/angular/controllers/changeServicesModalWindow.controller.js"></script>
    <script src="/remontas/public/angular/controllers/lkWorkManage.controller.js"></script>
    <script src="/remontas/public/angular/controllers/master.controller.js"></script>
    <script src="/remontas/public/angular/controllers/workViewer.controller.js"></script>
    <script src="/remontas/public/angular/controllers/compare.controller.js"></script>


    <!-- Директивы-->
    <script src="/remontas/public/angular/directives.js"></script>

    <!--  Сервисы  -->
    <script src="/remontas/public/angular/services/services.js"></script>
    <script src="/remontas/public/angular/services/AuthServices.js"></script>

</body>

</html>
