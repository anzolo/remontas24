<!DOCTYPE html>
<html lang="en">

<head>
    <base href="/">
    <meta charset="UTF-8">
    <title>Ремонтас 24 - Мастер найдется!</title>
    <link type="text/css" rel="stylesheet" href="/remontas/public/css/normalize.css">
    <link rel="stylesheet" type="text/css" href="/remontas/public/css/custom.css">
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
    <script src="/remontas/public/bower_components/angular-route/angular-route.min.js"></script>
    <script src="/remontas/public/bower_components/ngstorage/ngStorage.min.js"></script>
    <script src="/remontas/public/bower_components/angular-resource/angular-resource.min.js"></script>

</head>

<body ng-app="remontas24Site">
    <div class="wrapper" ng-controller="mainController">
        <div class="content">
            <div class="header">
                <div class="container clearfix">
                    <a href="/" class="logo"></a>
                    <ul class="top-menu">
                        <li class="active">Главная</li>
                        <li class="dropdown">
                            <a href="#">Мастерам</a>
                            <ul>
                                <li><a href="#" class="open-modal" data-modal-name="auth-tabs">Вход/Регистрация</a></li>
                                <li><a href="#">Как это работает</a></li>
                            </ul>
                        </li>
                        <li><a href="#">Вопрос/Ответ</a></li>
                    </ul>
                    <div class="comparison-list"><span>6</span>Список сравнения</div>
                </div>
            </div>


            <div class="container">
                <h2 class="text-center">Подбор мастера</h2>
                <div class="filter clearfix">
                    <div class="service-1">
                        <input type="text" readonly="readonly" required="required" placeholder="Выберите услугу">
                        <div class="sub">
                            <div>Натяжные потолки</div>
                            <div>Мебель на заказ</div>
                            <div>Ремонтно-отделочные работы</div>
                            <div>Дизайн интерьеров</div>
                        </div>
                    </div>
                    <div class="service-2">
                        <input type="text" readonly="readonly" required="required" placeholder="Выберите услугу">
                        <div class="sub">
                            <div>Ремонт квартир</div>
                            <div>Ремонт офисов</div>
                            <div>Ремонт ванной</div>
                        </div>
                    </div>
                    <div class="service-3">
                        <input type="text" readonly="readonly" required="required" placeholder="Услуга мастер на час">
                        <div class="sub">
                            <div>Услуга мастер на час</div>
                            <div class="counter">Отмечено услуг <strong>0</strong></div>
                            <div><span>Работа по договору</span></div>
                            <div><span>Услуга мастер на час</span></div>
                            <abbr class="btn">Выбрать</abbr>
                        </div>
                    </div>
                    <button disabled="disabled">Подобрать</button>
                </div>

                <masters-search-box masters="searchResult.masters" masters-count="searchResult.masters_count" max-page="searchResult.max_page" current-page="searchResult.current_page"></masters-search-box>

            </div>

            <div class="container">
                <h2 class="text-center">Преимущества</h2>
                <div class="privilege clearfix">
                    <a href="#" class="block item">
                        <h2>&laquo;Живая база&raquo;<br/>мастеров</h2>
                        <div class="img"><img src="/remontas/public/img/icon-big-phone.png" width="68" height="76"></div>
                        <p>Мы лично позвонили
                            <br/>каждому мастеру</p>
                    </a>
                    <a href="#" class="block item">
                        <h2>Экономия времени <br/>и средств</h2>
                        <div class="img"><img src="/remontas/public/img/icon-big-clock.png" width="68" height="84"></div>
                        <p>Выберите понравившихся
                            <br/>мастеров и сравните их цены</p>
                    </a>
                    <a href="#" class="block item">
                        <h2>Ремонт &laquo;под ключ&raquo;<br/>на одном сайте</h2>
                        <div class="img"><img src="/remontas/public/img/icon-big-brush.png" width="76" height="80"></div>
                        <p>Создайте свой уют
                            <br/>на одном сайте</p>
                    </a>
                </div>
            </div>

            <div class="container">
                <h2 class="text-center">Как пользоваться</h2>
                <div class="block how-to-use clearfix">
                    <div class="item">
                        <h2>Подберите</h2>
                        <img src="/remontas/public/img/round-1.png" width="88" height="88">
                        <p>мастера
                            <br/>из списка</p>
                    </div>
                    <div class="item arrow"><img src="/remontas/public/img/arrow-yellow-right.png" width="40" height="32"></div>
                    <div class="item">
                        <h2>Добавьте</h2>
                        <img src="/remontas/public/img/round-2.png" width="88" height="88">
                        <p>мастеров
                            <br/>к списку сравнения</p>
                    </div>
                    <div class="item arrow"><img src="/remontas/public/img/arrow-yellow-right.png" width="40" height="32"></div>
                    <div class="item">
                        <h2>Сравните</h2>
                        <img src="/remontas/public/img/round-3.png" width="88" height="88">
                        <p>услуги и цены
                            <br/>выбранных мастеров</p>
                    </div>
                    <div class="item arrow"><img src="/remontas/public/img/arrow-yellow-right.png" width="40" height="32"></div>
                    <div class="item">
                        <h2>Позвоните</h2>
                        <img src="/remontas/public/img/round-4.png" width="88" height="88">
                        <p>выбранному
                            <br/>мастеру</p>
                    </div>
                    <div class="item arrow"><img src="/remontas/public/img/arrow-yellow-right.png" width="40" height="32"></div>
                    <div class="item">
                        <h2>Не смогли</h2>
                        <img src="/remontas/public/img/round-5.png" width="88" height="88">
                        <p>подобрать мастера?
                            <br/>Нет времени?
                            <br/>Оставьте заявку</p>
                    </div>
                </div>
            </div>


        </div>


        <div class="footer">
            <div class="container clearfix">
                <a href="http://alivedream.ru" class="logo-dp"></a>
                <ul class="bottom-menu">
                    <li><a href="#"><span class="icon-info"></span>О проекте</a></li>
                    <li><a href="#"><span class="icon-doc"></span>Договор оферты</a></li>
                </ul>
                <div class="social">
                    <div class="descr">Мы в соц. медиа</div>
                    <a href="#" class="vk"></a>
                    <a href="#" class="fb"></a>
                </div>
            </div>
        </div>
    </div>


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
