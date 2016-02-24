function check_form(form, event) {
	var self = event.target;
	var deactivate_submit = 0;
	$(self).removeClass('required');
	if ($(self).val().length == 0) {
		$(self).addClass('required');
	}

	// Деактивация кнопки submit
	var required_fields = $(form).find('input[required="required"], textarea[required="required"]');
	$(required_fields).each(function(i, field){
		if ($(field).val().length == 0) {
			deactivate_submit = 1;
		}
	});
	if (deactivate_submit) {
		$(form).find('button').attr('disabled', 'disabled');
	}
	else {
		$(form).find('button').removeAttr('disabled');
	}

}

$(function() {

	var modal_place = $('#modal');
	var services_counter = 0;

	/**
	 * Отображение модального окна
	 */
//	$('.open-modal').on('click', function() {
//		$('#modal > div').removeClass('active');
//		var modal_name = $(this).data('modal-name');
//		// Отключить скроллинг страницы
//		//$('html, body').css("overflow", "hidden");
//		modal_place.show();
//		modal_place.find('#' + modal_name).addClass('active');
//		return false;
//	});

	/**
	 * Закрытие модального окна
	 */
//	$('.close-modal').on('click', function() {
//		var modal_name = $(this).data('modal-name');
//		// Включить обратно скроллинг страницы
//		//$('html, body').css("overflow", "auto");
//		modal_place.find('#' + modal_name).removeClass('active');
//		modal_place.hide();
//	});



	/**
	 * Отображение окна подсказок "Что даёт?"
	 */
	$('.open-hint').on('click', function(e) {
		e.preventDefault();
		var hint_name = $(this).data('hint-name');
		$('#' + hint_name).addClass('active');
	});

	/**
	 * Закрытие окна подсказок
	 */
	$('.hint-window').on('mouseleave', function() {
		$(this).removeClass('active');
	});



	/**
	 * Переключение табов авторизации/регистрации
	 */
//	$('#auth-tabs > .tabs-header').on('click', '> div', function(){
//		var tab = $(this).data('tab');
//		$('#auth-tabs > .tabs-header > div').removeClass('active');
//		$('#auth-tabs > .tabs-content > div').removeClass('active');
//		$(this).addClass('active');
//		$('#auth-tabs #' + tab).addClass('active');
//	});
	/**
	 * Переключение табов авторизации/регистрации: "частная бригада" / "компания"
	 */
	$('#auth-tabs .sub-tabs-header').on('click', '> div', function(){
		var sub_tab = $(this).data('sub-tab');
		$('#auth-tabs .sub-tabs-header > div').removeClass('active');
		$('#auth-tabs #sub-tab-1').removeClass('active');
		$('#auth-tabs #sub-tab-2').removeClass('active');
		$('#hint-what-gives').trigger('mouseleave');
		$(this).addClass('active');
		$('#auth-tabs #' + sub_tab).addClass('active');
	});


	/**
//	 * Верхнее меню: открытие подменю
//	 */
//	$('.header .top-menu > li.dropdown').on('mouseenter', function(){
//		$(this).find('ul').addClass('active');
//	});
//
//
//
//	/**
//	 * Верхнее меню: закрытие подменю
//	 */
//	$('.header .top-menu > li.dropdown').on('mouseleave', function(){
//		$(this).find('ul').removeClass('active');
//	});



	/**
	 * Фильтр мастеров: Открытие подменю
	 */
	$('.filter > div').on('click', 'input', function(){
		$(this).closest('div').find('.sub').show();
	});



	/**
	 * Фильтр мастеров: Скрытие подменю
	 */
	$('.filter > div').on('mouseleave', '.sub', function(){
		$(this).hide();
	});



	/**
	 * Фильтр мастеров: Выбор пункта подменю
	 */
	$('.filter > div:not(".service-3") .sub').on('click', '> div', function(){
		var text = $(this).text();
		var input = $(this).closest('div[class*="service-"]').find('input');
		input.val(text);

		// Манипуляции с focus, для запуска события по проверке полей формы
		input.focus();
		$('.filter .service-3').find('input').focus();

		$(this).trigger('mouseleave');
	});



	/**
	 * Фильтр мастеров: Услуга "Мастер на час"
	 */
	$('.filter > .service-3').on('click', '.sub > div:not(:nth-of-type(1)):not(:nth-of-type(2)) > span', function(){
		var span = $(this);
		if (span.hasClass('active')) {
			span.removeClass('active');
		}
		else {
			span.addClass('active');
		}
		services_counter = parseInt(span.closest('.sub').find('span.active').length);
		$('.filter .service-3 .counter strong').html(services_counter);
	});



	/**
	 * Фильтр мастеров: Услуга "Мастер на час" - клик по кнопке "Выбрать"
	 */
	$('.filter > .service-3').on('click', '.btn', function(){
		//var services_amount = $('.service-3 .counter strong').text();
		var input = $('.filter .service-3 input');
		input.val('Выбрано услуг ' + services_counter);

		// Манипуляции с focus, для запуска события по проверке полей формы
		if (services_counter == 0) {
			input.val('');
		}
		input.focus();
		$('.filter .service-1').find('input').focus();


		$(this).trigger('mouseleave');
	});



	/**
	 * Заявка: переключение табов "По email" / "По телефону"
	 */
	$('#order .order-tabs-header').on('click', '> div', function(){
		var tab = $(this).data('tab');
		$('#order .order-tabs-header > div').removeClass('active');
		$('#order #order-tab-1').removeClass('active');
		$('#order #order-tab-2').removeClass('active');
		$(this).addClass('active');
		$('#order #' + tab).addClass('active');
	});



	/**
	 * Заявка: Открытие подменю
	 */
	$('#order .interest').on('click', '> input', function(){
		$(this).closest('div').find('.sub').show();
	});



	/**
	 * Заявка: Скрытие подменю
	 */
	$('#order .interest').on('mouseleave', '.sub', function(){
		$(this).hide();
	});



	/**
	 * Заявка: Выбор пункта подменю
	 */
	$('#order .interest .sub').on('click', '> div', function(){
		var text = $(this).text();
		var parent_interest = $(this).closest('.interest');
		var input = parent_interest.find('input');
		input.val(text);

		// Манипуляции с focus, для запуска события по проверке полей формы
		input.focus();
		parent_interest.next('textarea').focus();

		$(this).trigger('mouseleave');
	});


	/**
	 * Проверка на заполненность обязательных полей форм
	 */
	var check_forms = $(
		'.filter,' +
		'#tab-1,' +
		'#sub-tab-1,' +
		'#sub-tab-2,' +
		'#order-tab-1,' +
		'#order-tab-2,' +
		'#forget,' +
		'.my .person,' +
		'#add-service .add-form'
	);
	check_forms.each(function(index, form) {
		$(form).on('focusout', 'input[required="required"], textarea[required="required"]', function(e){
			check_form(form, e);
		});
		$(form).on('keyup', 'input[required="required"], textarea[required="required"]', function(e){
			check_form(form, e);
		});

	});


	/**
	 *  Мастер -> Услуги: развернуть
	 */
	$('.service-list').on('click', '.open-more', function(){
		var service_list = $(this).closest('.service-list');
		var this_list = $(this).closest('div');
		var open_link = $(this);
		var close_link = open_link.next('.close-more');

		//service_list.find('> div').removeClass('active');
		this_list.addClass('active');
		this_list.find('.more').addClass('active');
		open_link.hide();
		close_link.show();

		return false;
	});

	/**
	 *  Мастер -> Услуги: свернуть
	 */
	$('.service-list').on('click', '.close-more', function(){

		var service_list = $(this).closest('.service-list');
		var this_list = $(this).closest('div');
		var close_link = $(this);
		var open_link = close_link.prev('.open-more');

		//service_list.find('> div').removeClass('active');
		this_list.removeClass('active');
		this_list.find('.more').removeClass('active');
		close_link.hide();
		open_link.show();

		return false;
	});

	/**
	 *  ЛК -> Услуги: показать "удалить"
	 */
	$('.my .service-list > div > div:not(.more), .my .service-list > div > .more > div').on('mouseenter', function(){
		$(this).find('.del').show();
	});
	$('.my .service-list > div > div:not(.more), .my .service-list > div > .more > div').on('mouseleave', function(){
		$(this).find('.del').hide();
	});



	/**
	 * Fancybox
	 */
	$(".fancybox").fancybox({
		helpers : {
			title: {
				type: 'inside',
				position: 'top'
			},
			// Отключение скачка в верх страницы при клике на fancybox
			overlay: {
				locked: false
			}
		}
	});



	/**
	 *  ЛК -> Работы: показать "редактировать"
	 */
	$('.my .works').on('mouseenter', '.item', function(){
		$(this).find('.edit').show();
	});
	$('.my .works').on('mouseleave', '.item', function(){
		$(this).find('.edit').hide();
	});



	/**
	 *  ЛК - Работы - Modal Добавить: показать "изменить / удалить"
	 */
	$('#add-work .works').on('mouseenter', '.item', function(){
		$(this).find('.edit').show();
	});
	$('#add-work .works').on('mouseleave', '.item', function(){
		$(this).find('.edit').hide();
	});



	/**
	 * Сравнение мастеров
	 */
	$('.page .comparison').on('mouseenter', '[data-param]', function(e){
		var elem = e.currentTarget;
		var param_name = $(elem).data('param');
		$('.page .comparison').find('[data-param="'+ param_name +'"]').addClass('active');
	});
	$('.page .comparison').on('mouseleave', '[data-param]', function(e){
		var elem = e.currentTarget;
		var param_name = $(elem).data('param');
		$('.page .comparison').find('[data-param="'+ param_name +'"]').removeClass('active');
	});



	/**
	 * ЛК - Выбор категории/доп.услуг: Открытие подменю
	 */
	$('.my .selectors > div').on('click', 'input', function() {
		$(this).closest('div').find('.sub').show();
	});



	/**
	 * ЛК - Выбор категории/доп.услуг: Скрытие подменю
	 */
	$('.my .selectors > div').on('mouseleave', '.sub', function(){
		$(this).hide();
	});



	/**
	 * ЛК - Выбор категории: Выбор пункта меню
	 */
	$('.my .selectors > .service-1').on('click', '.sub > div:not(:nth-of-type(1)) > span', function(){
		var span = $(this);
		if (span.hasClass('active')) {
			span.removeClass('active');
		}
		else {
			span.addClass('active');
		}
		services_counter = parseInt(span.closest('.sub').find('span.active').length);
		$('.my .selectors .service-1 .counter strong').html(services_counter);
	});



	/**
	 * ЛК - Выбор доп.услуг: Выбор пункта меню
	 */
	$('.my .selectors > .service-2').on('click', '.sub > div:not(:nth-of-type(1)) > span', function(){
		var span = $(this);
		if (span.hasClass('active')) {
			span.removeClass('active');
		}
		else {
			span.addClass('active');
		}
		services_counter = parseInt(span.closest('.sub').find('span.active').length);
		$('.my .selectors .service-2 .counter strong').html(services_counter);
	});



	/**
	 * ЛК - Выбор категории: Клик по кнопке "Выбрать"
	 */
	$('.my .selectors > .service-1').on('click', '.btn', function(){
		//var services_amount = $('.service-3 .counter strong').text();
		var input = $('.my .selectors .service-1 input');
		input.val('Выбрано услуг ' + services_counter);

		// Манипуляции с focus, для запуска события по проверке полей формы
		if (services_counter == 0) {
			input.val('');
		}
		input.focus();
		$('.my .selectors .service-2').find('input').focus();


		$(this).trigger('mouseleave');
	});



	/**
	 * ЛК - Выбор доп.услуг: Клик по кнопке "Выбрать"
	 */
	$('.my .selectors > .service-2').on('click', '.btn', function(){
		//var services_amount = $('.service-3 .counter strong').text();
		var input = $('.my .selectors .service-2 input');
		input.val('Выбрано услуг ' + services_counter);

		// Манипуляции с focus, для запуска события по проверке полей формы
		if (services_counter == 0) {
			input.val('');
		}
		input.focus();
		$('.my .selectors .service-1').find('input').focus();


		$(this).trigger('mouseleave');
	});



	/**
	 * ЛК - Добавление услуг: Открытие подменю
	 */
	$('#add-service').on('click', '.item .some-service input', function() {
		$(this).closest('div').find('.sub').show();
	});



	/**
	 * ЛК - Добавление услуг: Скрытие подменю
	 */
	$('#add-service').on('mouseleave', '.item .sub', function(){
		$(this).hide();
	});



	/**
	 * ЛК - Добавление услуг: Выбор пункта меню
	 */
	$('#add-service').on('click', '.item .sub > div', function(){
		var text = $(this).text();
		var input = $(this).closest('.some-service').find('input');
		input.val(text);

		// Манипуляции с focus, для запуска события по проверке полей формы
		input.focus();
		input.closest('.item').find('.price input').focus();

		$(this).trigger('mouseleave');
	});


	/**
	 * ЛК- Добавление услуг - Добавление списка работ в DOM
	 */
	$('#add-service').on('click', 'a', function(){
		var tpl = $('#add-service').find('.template-service-hidden');
		var last_item = $('#add-service .add-form .item:last-of-type');
		var submit = $(this).next('button');
		tpl.clone().insertAfter(last_item).removeClass('template-service-hidden');
		submit.attr('disabled', 'disabled');
	});


	/**
	 * Сравнение мастеров: горизонтальная прокрутка
	 */
	// Подсчёт ширины блока с мастерами
	var items = $(".page .comparison .masters .item");
	var common_width = 0;
	items.each(function(){
		common_width += $(this).width();
	});
	$(".page .comparison .masters .inner").css("width", common_width);
	// Применение скролла
//	$(".page .comparison .masters").niceScroll({
//		cursorcolor: "#f2f2f2",
//		cursorwidth: "27px",
//		cursorborder: "2px solid #fff",
//		cursorborderradius: "15px",
//		cursoropacitymin: 1
//		//background: "transparent url('../img/scroll-horiz-1.png') no-repeat"
//		//touchbehavior: 1      // Скрол мышкой или пальцем
//	});


});
