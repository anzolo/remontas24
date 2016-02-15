<!DOCTYPE html>
<html lang="en">

<head>
    <base href="/">
    <meta charset="UTF-8">
    <title>Ремонтас 24 - Мастер найдется!</title>
    <link type="text/css" rel="stylesheet" href="/remontas/public/css/normalize.css">
    <link rel="stylesheet" type="text/css" href="/remontas/public/css/custom.css">
    <link rel="stylesheet" href="/remontas/public/js/fancybox/source/jquery.fancybox.css?v=2.1.5" type="text/css" media="screen" />
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,300&subset=latin,cyrillic' rel='stylesheet' type='text/css'>
    <link rel="shortcut icon" href="/remontas/public/favicon.ico" />
    <meta name="viewport" content="width=1250">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->

    <script src="/remontas/public/bower_components/angular/angular.min.js"></script>
    <script src="/remontas/public/bower_components/ngstorage/ngStorage.min.js"></script>
    <script src="/remontas/public/bower_components/angular-resource/angular-resource.min.js"></script>
    <script src="/remontas/public/bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>

</head>

<body ng-app="remontas24Site">
    <div ui-view></div>

    <div id="order-btn" class="open-modal" data-modal-name="order"></div>


    <div id="modal">
        <!-- Вход/Регистрация -->
        <div id="auth-tabs">
            <div class="close-modal"></div>

            <div class="tabs-header clearfix">
                <div class="active" data-tab="tab-1">Вход</div>
                <div data-tab="tab-2">Регистрация</div>
            </div>

            <div class="tabs-content clearfix">
                <div class="active clearfix" id="tab-1">
                    <input type="text" placeholder="Email" required="required" />
                    <input type="password" placeholder="Пароль" required="required" />
                    <a href="#" class="open-modal" data-modal-name="forget">Забыли пароль?</a>
                    <button disabled="disabled">Вход</button>
                </div>

                <div class="clearfix" id="tab-2">
                    <div style="text-align: center">Кто вы?</div>

                    <div class="sub-tabs-header clearfix">
                        <div class="sub-tab-1 active" data-sub-tab="sub-tab-1">Частная бригада</div>
                        <div class="sub-tab-2" data-sub-tab="sub-tab-2">Компания</div>
                    </div>

                    <div id="sub-tab-1" class="active">
                        <input type="text" placeholder="Фамилия" required="required" />
                        <input type="text" placeholder="Имя" required="required" />
                        <input type="text" placeholder="Отчество" />
                        <input type="text" placeholder="Ваш email" required="required" />
                        <input type="password" placeholder="Пароль" required="required" />
                        <a href="#" class="open-hint" data-hint-name="hint-what-gives">Что даёт?</a>
                        <button disabled="disabled">Регистрация</button>
                    </div>

                    <div id="sub-tab-2">
                        <input type="text" placeholder="Название компании" required="required" />
                        <input type="text" placeholder="Ваш email" required="required" />
                        <input type="password" placeholder="Пароль" required="required" />
                        <a href="#" class="open-hint" data-hint-name="hint-what-gives">Что даёт?</a>
                        <button disabled="disabled">Регистрация</button>
                    </div>

                    <!-- Что даёт регистрация? -->
                    <div id="hint-what-gives" class="hint-window">
                        <div class="corner"></div>
                        <div class="body">
                            <p>Какой-то HTML-инфотекст</p>
                        </div>
                    </div>
                    <!-- /Что даёт регистрация? -->


                </div>
            </div>
        </div>
        <!-- /Вход/Регистрация -->


        <!-- Заявка на мастера -->
        <div id="order">
            <div class="close-modal"></div>
            <p>ЗАЯВКА НА ПОДБОР МАСТЕРА</p>
            <p style="font-weight: 300">Как с вами связаться?</p>

            <div class="order-tabs-header clearfix">
                <div class="tab-1 active" data-tab="order-tab-1">По email</div>
                <div class="tab-2" data-tab="order-tab-2">По телефону</div>
            </div>

            <div id="order-tab-1" class="active">
                <input type="text" placeholder="Email" required="required" />
                <div class="interest">
                    <input type="text" placeholder="Меня интересует" required="required" readonly="readonly">
                    <div class="sub">
                        <div>Натяжные потолки</div>
                        <div>Мебель на заказ</div>
                        <div>Ремонтно-отделочные работы</div>
                        <div>Дизайн интерьеров</div>
                    </div>
                </div>
                <textarea placeholder="Комментарий" required="required"></textarea>
                <button disabled="disabled">Отправить</button>
            </div>

            <div id="order-tab-2">
                <input type="text" placeholder="Телефон +7" required="required" />
                <div class="interest">
                    <input type="text" placeholder="Меня интересует" required="required" readonly="readonly">
                    <div class="sub">
                        <div>Натяжные потолки</div>
                        <div>Мебель на заказ</div>
                        <div>Ремонтно-отделочные работы</div>
                        <div>Дизайн интерьеров</div>
                    </div>
                </div>
                <textarea placeholder="Комментарий" required="required"></textarea>
                <button disabled="disabled">Отправить</button>
            </div>

        </div>
        <!-- /Заявка на мастера -->


        <!-- Забыл пароль -->
        <div id="forget">
            <div class="close-modal"></div>
            <h4>Восстановление пароля</h4>
            <p style="font-weight: 300">Введите email указанный при регистрации</p>
            <input type="text" placeholder="Email" required="required" />
            <button disabled="disabled">Отправить</button>
        </div>
        <!-- /Забыл пароль -->
    </div>


    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script type="text/javascript" src="/remontas/public/js/custom.js"></script>
    <script type="text/javascript" src="/remontas/public/js/fancybox/source/jquery.fancybox.pack.js?v=2.1.5"></script>

    <!-- Модули -->
    <script src="/remontas/public/angular/remontas24Site.js"></script>

    <!-- Контроллеры -->
    <script src="/remontas/public/angular/controllers/mainController.js"></script>

    <!-- Директивы-->
    <script src="/remontas/public/angular/directives.js"></script>

    <!--  Сервисы  -->
    <script src="/remontas/public/angular/services.js"></script>

</body>

</html>
