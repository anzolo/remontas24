from pymongo import MongoClient

debug = True

client = MongoClient()
db = client.remontas24

session_priv_key = b'-----BEGIN RSA PRIVATE KEY----- -----END RSA PRIVATE KEY-----'
session_pub_key = b'-----BEGIN PUBLIC KEY----- -----END PUBLIC KEY-----'

session_time_out_minutes_admin = 30
session_time_out_minutes_master = 1440
img_no_avatar = "img-user-no-photo.png"

addServicesDict = [{"_id": "contractWork", "name": "Работа по договору"}, {
    "_id": "masterOnHour", "name": "Услуга мастер на час"}]

# часть пути для сборки ссылки на изображения.
img_url_path = "/storage/"
img_url_work_path = "/storage/works/"
common_files_path = "/common/"

configUrl = {"img_url_path": img_url_path, "img_url_work_path": img_url_work_path,
             "common_files_path": common_files_path, "img_no_avatar": img_no_avatar}

# для сохранения файлов
works_path = "static/storage/works/"
storage_path = "static/storage/"

watermarkPath = "static/remontas/public/img/watermark.png"

# для генерации sitemap.xml
path_to_sitemap_xml = 'static/sitemap.xml'


# настройки главной страницы
max_masters_batch = 15

# настройка отправки почты
fromAddress = 'robot@yandex.ru'
smtp_server = 'smtp.yandex.ru'
smtp_port = 465
mailLogin = "robot@yandex.ru"
mailPassword = "password"

# текст стандартных уведомлений
# Сразу после регистрации
messageRegisterMasterText = "Здравствуйте, {name}! \nВы успешно зарегистрировались на сайте Remontas24.ru. \nДля получения доступа к личному кабинету, необходимо подтвердить Вашу электронную почту. \nДля этого пройдите по ссылке: {siteURL}.\n\nC уважением, команда сервиса Remontas24.ru({siteURL})"
messageRegisterMasterHTML = "<h2>Здравствуйте, {name}!</h2> Вы успешно зарегистрировались на сайте Remontas24.ru. <br>Для получения доступа к личному кабинету, необходимо подтвердить Вашу электронную почту.<br>Для этого пройдите по ссылке: <a href='{siteURL}'>{siteURL}</a>. <br><br> C уважением, команда сервиса <a href='{siteURL}'>Remontas24.ru</a>"

# после подтверждения электронного ящика
messageVerifyEmailText = "Здравствуйте, {name}! \nВаша электронная почта подтверждена. Теперь Вы можете зайти в личный кабинет и заполнить свое портфолио.\n\nC уважением, команда сервиса Remontas24.ru({siteURL})."
messageVerifyEmailHTML = "<h2>Здравствуйте, {name}!</h2>Ваша электронная почта подтверждена. Теперь Вы можете зайти в личный кабинет и заполнить свое портфолио.<br><br> C уважением, команда сервиса <a href='{siteURL}'>Remontas24.ru</a>"

# восстановление пароля
messagePasswordRecoveryEmailText = "Здравствуйте, {name}! \nПароль успешно сброшен. \nНовый пароль: {password} \n\nC уважением, команда сервиса Remontas24.ru({siteURL})."
messagePasswordRecoveryEmailHTML = "<h2>Здравствуйте, {name}!</h2>Пароль успешно сброшен. <br> Новый пароль: {password} <br><br> C уважением, команда сервиса <a href='{siteURL}'>Remontas24.ru</a>"

# уведомление о успешно оставленной заявке
messageOrdersSuccessEmailText = "Здравствуйте! \nВаша заявка принята. \nВ ближайшее время с Вами свяжется мастер.  \n\nC уважением, команда сервиса Remontas24.ru({siteURL})."
messageOrdersSuccessEmailHTML = "<h2>Здравствуйте!</h2>Ваша заявка принята. <br>В ближайшее время с Вами свяжется мастер. <br><br> C уважением, команда сервиса <a href='{siteURL}'>Remontas24.ru</a>"

# уведомление администраторам о новой заявке
messageOrdersNotifyAdminsEmailText = "Здравствуйте! \nПоступила новая заявка.\nКатегория: {category}\nКомментарий: {comment}\nКонтакты: {contacts}\n Переход в админку {adminkaURL} \n\nC уважением, команда сервиса Remontas24.ru({siteURL})."
messageOrdersNotifyAdminsEmailHTML = "<h2>Здравствуйте!</h2>Поступила новая заявка.<br>Категория: {category}<br>Комментарий: {comment}<br>Контакты: {contacts}<br> Переход в админку {adminkaURL} <br><br> C уважением, команда сервиса <a href='{siteURL}'>Remontas24.ru</a>"
