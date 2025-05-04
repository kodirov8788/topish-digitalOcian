// src/routes/googlePlay-route.js

function DeleteAccount(req, res) {
  res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>Delete Account - Play Market</title>
              <style nonce="${res.locals.nonce}">
                  body { font-family: Arial, sans-serif; padding-top: 150px; background-color: #f9f9f9; }
                  .error { color: red; }
                  .success { color: green; }
                  h2, p { text-align: center; color: #333; }
                  form { margin-top: 20px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 400px; margin: 0 auto; }
                  label, input, button { display: block; width: 100%; margin-bottom: 10px; }
                  input, button { padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                  button { background-color: #007bff; color: white; cursor: pointer; border: none; }
                  button:hover { background-color: #0056b3; }
                  .hidden { display: none; }
              </style>
          </head>
          <body>
              <h2>Delete Account</h2>
              <p>Enter your phone number to receive a confirmation code for deleting your Play Market account</p>
              <form id="sendDeleteAccountCodeForm">
                  <label for="phoneNumber">Phone Number (9-digit):</label>
                  <input type="text" id="phoneNumber" name="phoneNumber" pattern="\\d{9}" placeholder="123456789" required>
                  <button type="submit">Send Confirmation Code</button>
                  <p id="message"></p>
              </form>
              <h2 id="confirmSectionTitle" class="hidden">Confirm Account Deletion</h2>
              <p id="confirmSectionText" class="hidden">Enter the confirmation code sent to your phone number</p>
              <form id="confirmDeleteAccountForm" class="">
                  <label for="confirmationCode">Confirmation Code:</label>
                  <input type="text" id="confirmationCode" name="confirmationCode" required>
                  <button type="submit">Confirm Deletion</button>
                  <p id="confirmMessage"></p>
              </form>
              <script nonce="${res.locals.nonce}">
                  document.addEventListener('DOMContentLoaded', () => {
                      const sendCodeForm = document.getElementById('sendDeleteAccountCodeForm');
                      const confirmSectionTitle = document.getElementById('confirmSectionTitle');
                      const confirmSectionText = document.getElementById('confirmSectionText');
                      const confirmDeleteForm = document.getElementById('confirmDeleteAccountForm');
                      const phoneNumberInput = document.getElementById('phoneNumber');
                      const confirmationCodeInput = document.getElementById('confirmationCode');

                      sendCodeForm.addEventListener('submit', function (e) {
                          e.preventDefault();
                          const phoneNumber = phoneNumberInput.value;
                          const formData = { phoneNumber: phoneNumber };

                          fetch('/api/v1/auth/sendDeleteAccountCode', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(formData)
                          })
                          .then(response => response.json())
                          .then(data => {
                              const messageElem = document.getElementById('message');
                              if (data.status === 'success') {
                                  messageElem.textContent = data.message;
                                  messageElem.className = 'success';
                                  confirmSectionTitle.classList.remove('hidden');
                                  confirmSectionText.classList.remove('hidden');
                                  confirmDeleteForm.classList.remove('hidden');
                              } else {
                                  throw new Error(data.message);
                              }
                          })
                          .catch(error => {
                              const messageElem = document.getElementById('message');
                              messageElem.textContent = error.message;
                              messageElem.className = 'error';
                          });
                      });

                      confirmDeleteForm.addEventListener('submit', function (e) {
                          e.preventDefault();
                          const phoneNumber = phoneNumberInput.value;
                          const confirmationCode = confirmationCodeInput.value;
                          const formData = { phoneNumber: phoneNumber, confirmationCode: confirmationCode };

                          fetch('/api/v1/auth/confirmDeleteAccount', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(formData)
                          })
                          .then(response => response.json())
                          .then(data => {
                              const confirmMessageElem = document.getElementById('confirmMessage');
                              if (data.status === 'success') {
                                  confirmMessageElem.textContent = data.message;
                                  confirmMessageElem.className = 'success';
                                  phoneNumberInput.value = "";
                                  confirmationCodeInput.value = "";
                                  sendCodeForm.reset();
                                  confirmDeleteForm.reset();
                              } else {
                                  throw new Error(data.message);
                              }
                          })
                          .catch(error => {
                              const confirmMessageElem = document.getElementById('confirmMessage');
                              confirmMessageElem.textContent = error.message;
                              confirmMessageElem.className = 'error';
                          });
                      });
                  });
              </script>
          </body>
          </html>
      `);
}

function PrivatePolicy(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Globance Privacy Policy</title>
      <style nonce="${res.locals.nonce}">
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        .head_text {
          margin-top: 100px;
        }
        h1 {
          text-align: center;
        }
        h2 {
          margin-top: 30px;
          margin-bottom: 15px;
          color: #333;
        }
        ol {
          padding-left: 20px;
        }
        ul {
          padding-left: 30px;
          list-style-type: disc;
        }
        li {
          margin-bottom: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        .separator {
          border-top: 1px solid #ddd;
          margin: 30px 0;
        }
        .policy-date {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
        }
        #language-selector {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border: 1px solid #ccc;
          padding: 10px 15px;
          border-radius: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          cursor: pointer;
          width: 200px;
        }
    
        #language-selector:hover {
          box-shadow: 0 6px 10px rgba(0,0,0,0.15);
        }
    
        #language-selector select {
          border: none;
          background: transparent;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          padding-left: 80px;
          font-size: 16px;
          cursor: pointer;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        #language-selector select:focus{
          border: none;
          outline: none;
        }
        .language-icon {
          display: flex;
          align-items: center;
        }
    
        .language-icon:before {
          content: "\\1F310";
          font-size: 18px;
          margin-right: 8px;
        }
    
        .arrow-icon:before {
          content: "\\25BC";
          font-size: 12px;
          margin-left: 8px;
        }
      </style>
    </head>
    <body>
      <div id="language-selector">
        <div class="language-icon"></div>
        <select id="language-switch" onchange="console.log(this.value)">
          <option value="eng">English</option>
          <option value="rus">Русский</option>
          <option value="uzb">O'zbek</option>
          <option value="zh">中文</option>
        </select>
        <div class="arrow-icon"></div>
      </div>
      
      <h1 class="head_text" 
          data-eng="Globance Privacy Policy" 
          data-rus="Политика конфиденциальности Globance" 
          data-uzb="Globance Maxfiylik Siyosati"
          data-zh="Globance 隐私政策">
        Globance Privacy Policy
      </h1>
      
      <div class="policy-date">
        <p data-eng="Effective Date: 2025.01.01<br>Last Updated: 2025.05.01" 
           data-rus="Дата вступления в силу: 2025.01.01<br>Последнее обновление: 2025.05.01" 
           data-uzb="Kuchga kirish sanasi: 2025.01.01<br>Oxirgi yangilanish: 2025.05.01"
           data-zh="生效日期: 2025.01.01<br>最后更新: 2025.05.01">
          Effective Date: 2025.01.01<br>Last Updated: 2025.05.01
        </p>
      </div>
      
      <p data-eng="Welcome to Globance ("we," "our," "us"). We are committed to protecting your personal data and ensuring your experience with our services is secure, transparent, and respectful of your privacy rights."
         data-rus="Добро пожаловать в Globance («мы», «наш», «нас»). Мы стремимся защищать ваши личные данные и обеспечивать безопасность, прозрачность и уважение ваших прав на конфиденциальность при использовании наших услуг."
         data-uzb="Globance'ga xush kelibsiz ("biz", "bizning", "bizni"). Biz sizning shaxsiy ma'lumotlaringizni himoya qilish va xizmatlarimizdan foydalanish tajribangizni xavfsiz, shaffof va maxfiylik huquqlaringizga hurmat qilishni ta'minlashga intilamiz."
         data-zh="欢迎使用Globance（"我们"、"我们的"）。我们致力于保护您的个人数据，确保您使用我们服务的体验是安全、透明的，并尊重您的隐私权。">
        Welcome to Globance ("we," "our," "us"). We are committed to protecting your personal data and ensuring your experience with our services is secure, transparent, and respectful of your privacy rights.
      </p>
      
      <p data-eng="This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services ("App")."
         data-rus="Эта Политика конфиденциальности объясняет, как мы собираем, используем, раскрываем и защищаем вашу информацию, когда вы используете наше мобильное приложение и связанные с ним услуги («Приложение»)."
         data-uzb="Ushbu Maxfiylik siyosati bizning mobil ilovamiz va tegishli xizmatlardan ("Ilova") foydalanganingizda sizning ma'lumotlaringizni qanday to'plashimiz, foydalanishimiz, oshkor qilishimiz va himoya qilishimizni tushuntiradi."
         data-zh="本隐私政策解释了当您使用我们的移动应用程序及相关服务（"应用程序"）时，我们如何收集、使用、披露和保护您的信息。">
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services ("App").
      </p>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="1. Information We Collect" 
            data-rus="1. Информация, которую мы собираем" 
            data-uzb="1. Biz to'playdigan ma'lumotlar"
            data-zh="1. 我们收集的信息">
          1. Information We Collect
        </h2>
        
        <h3 data-eng="1.1. Information You Provide" 
            data-rus="1.1. Информация, предоставляемая вами" 
            data-uzb="1.1. Siz taqdim etadigan ma'lumotlar"
            data-zh="1.1. 您提供的信息">
          1.1. Information You Provide
        </h3>
        
        <p data-eng="When you register, create a profile, or use the features of our App, we may collect:"
           data-rus="Когда вы регистрируетесь, создаете профиль или используете функции нашего Приложения, мы можем собирать:"
           data-uzb="Ro'yxatdan o'tganingizda, profil yaratganingizda yoki Ilovamiz funksiyalaridan foydalanganingizda, biz quyidagilarni to'plashimiz mumkin:"
           data-zh="当您注册、创建个人资料或使用我们应用程序的功能时，我们可能会收集：">
          When you register, create a profile, or use the features of our App, we may collect:
        </p>
        
        <ul>
          <li data-eng="Full name, phone number, email address" 
              data-rus="Полное имя, номер телефона, адрес электронной почты" 
              data-uzb="To'liq ism, telefon raqami, elektron pochta manzili"
              data-zh="全名、电话号码、电子邮件地址">
            Full name, phone number, email address
          </li>
          <li data-eng="Gender, job title, industry, company information" 
              data-rus="Пол, должность, отрасль, информация о компании" 
              data-uzb="Jinsi, lavozimi, sanoat, kompaniya ma'lumotlari"
              data-zh="性别、职位、行业、公司信息">
            Gender, job title, industry, company information
          </li>
          <li data-eng="Profile pictures and resume files" 
              data-rus="Фотографии профиля и файлы резюме" 
              data-uzb="Profil rasmlari va rezyume fayllari"
              data-zh="个人资料照片和简历文件">
            Profile pictures and resume files
          </li>
          <li data-eng="Messages and communication logs" 
              data-rus="Сообщения и журналы коммуникаций" 
              data-uzb="Xabarlar va aloqa jurnallari"
              data-zh="消息和通信记录">
            Messages and communication logs
          </li>
        </ul>
        
        <h3 data-eng="1.2. Automatically Collected Information" 
            data-rus="1.2. Автоматически собираемая информация" 
            data-uzb="1.2. Avtomatik ravishda to'planadigan ma'lumotlar"
            data-zh="1.2. 自动收集的信息">
          1.2. Automatically Collected Information
        </h3>
        
        <p data-eng="We may automatically collect the following information:"
           data-rus="Мы можем автоматически собирать следующую информацию:"
           data-uzb="Biz quyidagi ma'lumotlarni avtomatik ravishda to'plashimiz mumkin:"
           data-zh="我们可能会自动收集以下信息：">
          We may automatically collect the following information:
        </p>
        
        <ul>
          <li data-eng="Device type, operating system, and unique device identifiers" 
              data-rus="Тип устройства, операционная система и уникальные идентификаторы устройства" 
              data-uzb="Qurilma turi, operatsion tizim va noyob qurilma identifikatorlari"
              data-zh="设备类型、操作系统和唯一设备标识符">
            Device type, operating system, and unique device identifiers
          </li>
          <li data-eng="IP address, browser type, time zone settings" 
              data-rus="IP-адрес, тип браузера, настройки часового пояса" 
              data-uzb="IP manzil, brauzer turi, vaqt mintaqasi sozlamalari"
              data-zh="IP地址、浏览器类型、时区设置">
            IP address, browser type, time zone settings
          </li>
          <li data-eng="Usage data (e.g., screens visited, buttons clicked)" 
              data-rus="Данные об использовании (например, посещенные экраны, нажатые кнопки)" 
              data-uzb="Foydalanish ma'lumotlari (masalan, tashrif buyurilgan ekranlar, bosilgan tugmalar)"
              data-zh="使用数据（如访问的屏幕、点击的按钮）">
            Usage data (e.g., screens visited, buttons clicked)
          </li>
          <li data-eng="Crash logs, error reports, and diagnostic data" 
              data-rus="Журналы сбоев, отчеты об ошибках и диагностические данные" 
              data-uzb="Nosozlik jurnallari, xato hisobotlari va diagnostika ma'lumotlari"
              data-zh="崩溃日志、错误报告和诊断数据">
            Crash logs, error reports, and diagnostic data
          </li>
        </ul>
        
        <h3 data-eng="1.3. Cookies and Tracking Technologies" 
            data-rus="1.3. Файлы cookie и технологии отслеживания" 
            data-uzb="1.3. Cookies va kuzatuv texnologiyalari"
            data-zh="1.3. Cookie和跟踪技术">
          1.3. Cookies and Tracking Technologies
        </h3>
        
        <p data-eng="We use cookies and similar technologies to improve your user experience, support analytics, and remember your preferences."
           data-rus="Мы используем файлы cookie и аналогичные технологии для улучшения вашего пользовательского опыта, поддержки аналитики и запоминания ваших предпочтений."
           data-uzb="Biz sizning foydalanuvchi tajribangizni yaxshilash, tahlillarni qo'llab-quvvatlash va afzalliklaringizni eslab qolish uchun cookie fayllaridan va o'xshash texnologiyalardan foydalanamiz."
           data-zh="我们使用Cookie和类似技术来改善您的用户体验、支持分析并记住您的偏好。">
          We use cookies and similar technologies to improve your user experience, support analytics, and remember your preferences.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="2. How We Use Your Information" 
            data-rus="2. Как мы используем вашу информацию" 
            data-uzb="2. Ma'lumotlaringizdan qanday foydalanamiz"
            data-zh="2. 我们如何使用您的信息">
          2. How We Use Your Information
        </h2>
        
        <p data-eng="We use the collected information to:"
           data-rus="Мы используем собранную информацию для:"
           data-uzb="Biz to'plangan ma'lumotlarni quyidagilar uchun ishlatamiz:"
           data-zh="我们使用收集的信息来：">
          We use the collected information to:
        </p>
        
        <ul>
          <li data-eng="Provide, operate, and maintain our services" 
              data-rus="Предоставления, эксплуатации и поддержки наших услуг" 
              data-uzb="Xizmatlarimizni taqdim etish, ishlatish va saqlash"
              data-zh="提供、运营和维护我们的服务">
            Provide, operate, and maintain our services
          </li>
          <li data-eng="Personalize your experience and content" 
              data-rus="Персонализации вашего опыта и контента" 
              data-uzb="Tajribangiz va kontentni shaxsiylashtirish"
              data-zh="个性化您的体验和内容">
            Personalize your experience and content
          </li>
          <li data-eng="Enable communication and networking features" 
              data-rus="Обеспечения функций коммуникации и нетворкинга" 
              data-uzb="Aloqa va tarmoqlashuv xususiyatlarini yoqish"
              data-zh="启用通信和社交功能">
            Enable communication and networking features
          </li>
          <li data-eng="Send updates, promotional content, and notifications (with your consent)" 
              data-rus="Отправки обновлений, промо-контента и уведомлений (с вашего согласия)" 
              data-uzb="Yangilanishlar, reklama tarkibi va bildirishnomalarni yuborish (sizning roziliginggiz bilan)"
              data-zh="发送更新、促销内容和通知（经您同意）">
            Send updates, promotional content, and notifications (with your consent)
          </li>
          <li data-eng="Ensure security, prevent fraud, and enforce legal terms" 
              data-rus="Обеспечения безопасности, предотвращения мошенничества и обеспечения соблюдения юридических условий" 
              data-uzb="Xavfsizlikni ta'minlash, firibgarlikni oldini olish va huquqiy shartlarni ta'minlash"
              data-zh="确保安全、防止欺诈并执行法律条款">
            Ensure security, prevent fraud, and enforce legal terms
          </li>
          <li data-eng="Analyze user behavior to improve the App's performance" 
              data-rus="Анализа поведения пользователей для улучшения производительности приложения" 
              data-uzb="Ilovaning ishlashini yaxshilash uchun foydalanuvchi xulq-atvorini tahlil qilish"
              data-zh="分析用户行为以提高应用程序的性能">
            Analyze user behavior to improve the App's performance
          </li>
        </ul>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="3. Sharing of Information" 
            data-rus="3. Обмен информацией" 
            data-uzb="3. Ma'lumotlarni ulashish"
            data-zh="3. 信息共享">
          3. Sharing of Information
        </h2>
        
        <p data-eng="We may share your information with:"
           data-rus="Мы можем делиться вашей информацией с:"
           data-uzb="Biz ma'lumotlaringizni quyidagilar bilan bo'lishishimiz mumkin:"
           data-zh="我们可能会与以下方共享您的信息：">
          We may share your information with:
        </p>
        
        <ul>
          <li data-eng="Service Providers: Hosting, analytics, push notifications, cloud storage" 
              data-rus="Поставщики услуг: хостинг, аналитика, push-уведомления, облачное хранилище" 
              data-uzb="Xizmat ko'rsatuvchilar: hosting, tahlillar, push-bildirishnomalar, bulutli saqlash"
              data-zh="服务提供商：托管、分析、推送通知、云存储">
            Service Providers: Hosting, analytics, push notifications, cloud storage
          </li>
          <li data-eng="Business Partners: If you connect with companies, job listings, or consultants" 
              data-rus="Бизнес-партнеры: если вы связываетесь с компаниями, списками вакансий или консультантами" 
              data-uzb="Biznes sheriklari: agar siz kompaniyalar, ish ro'yxatlari yoki maslahatchilar bilan bog'lansangiz"
              data-zh="业务合作伙伴：如果您与公司、职位列表或顾问联系">
            Business Partners: If you connect with companies, job listings, or consultants
          </li>
          <li data-eng="Legal Authorities: When required by law or to protect our rights" 
              data-rus="Правовые органы: когда это требуется по закону или для защиты наших прав" 
              data-uzb="Huquqiy organlar: qonun talab qilganda yoki huquqlarimizni himoya qilish uchun"
              data-zh="法律机构：当法律要求或为保护我们的权利">
            Legal Authorities: When required by law or to protect our rights
          </li>
          <li data-eng="Other Users: Only the information you choose to display in your public profile or in direct communication" 
              data-rus="Другие пользователи: только информация, которую вы решаете отображать в своем публичном профиле или при прямом общении" 
              data-uzb="Boshqa foydalanuvchilar: faqat sizning ommaviy profilingizda yoki to'g'ridan-to'g'ri aloqada ko'rsatishga tanlaydigan ma'lumotlar"
              data-zh="其他用户：仅限您选择在公开资料或直接通信中显示的信息">
            Other Users: Only the information you choose to display in your public profile or in direct communication
          </li>
        </ul>
        
        <p data-eng="We do not sell your personal data."
           data-rus="Мы не продаем ваши персональные данные."
           data-uzb="Biz sizning shaxsiy ma'lumotlaringizni sotmaymiz."
           data-zh="我们不会出售您的个人数据。">
          We do not sell your personal data.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="4. Data Storage and Security" 
            data-rus="4. Хранение и безопасность данных" 
            data-uzb="4. Ma'lumotlarni saqlash va xavfsizlik"
            data-zh="4. 数据存储和安全">
          4. Data Storage and Security
        </h2>
        
        <p data-eng="Your data is securely stored using encryption and access controls. We retain your information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law."
           data-rus="Ваши данные надежно хранятся с использованием шифрования и контроля доступа. Мы сохраняем вашу информацию до тех пор, пока это необходимо для выполнения целей, изложенных в этой политике, или в соответствии с требованиями закона."
           data-uzb="Sizning ma'lumotlaringiz shifrlash va kirish nazoratidan foydalangan holda xavfsiz saqlanadi. Biz sizning ma'lumotlaringizni ushbu siyosatda ko'rsatilgan maqsadlarni amalga oshirish uchun yoki qonun talab qilgandek zarur bo'lgan muddatga saqlaymiz."
           data-zh="您的数据使用加密和访问控制安全存储。我们会保留您的信息，只要有必要履行本政策中概述的目的，或者法律要求的时间。">
          Your data is securely stored using encryption and access controls. We retain your information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="5. Your Rights and Choices" 
            data-rus="5. Ваши права и выбор" 
            data-uzb="5. Sizning huquqlaringiz va tanlovlaringiz"
            data-zh="5. 您的权利和选择">
          5. Your Rights and Choices
        </h2>
        
        <p data-eng="Depending on your location, you may have rights including:"
           data-rus="В зависимости от вашего местоположения, у вас могут быть права, включая:"
           data-uzb="Joylashuvingizga qarab, siz quyidagi huquqlarga ega bo'lishingiz mumkin:"
           data-zh="根据您的位置，您可能拥有以下权利：">
          Depending on your location, you may have rights including:
        </p>
        
        <ul>
          <li data-eng="Accessing, correcting, or deleting your data" 
              data-rus="Доступ, исправление или удаление ваших данных" 
              data-uzb="Ma'lumotlaringizni ko'rish, tuzatish yoki o'chirish"
              data-zh="访问、更正或删除您的数据">
            Accessing, correcting, or deleting your data
          </li>
          <li data-eng="Objecting to or limiting data processing" 
              data-rus="Возражение против обработки данных или её ограничение" 
              data-uzb="Ma'lumotlarni qayta ishlashga qarshi chiqish yoki cheklash"
              data-zh="反对或限制数据处理">
            Objecting to or limiting data processing
          </li>
          <li data-eng="Withdrawing consent at any time" 
              data-rus="Отзыв согласия в любое время" 
              data-uzb="Istalgan vaqtda rozilikni qaytarib olish"
              data-zh="随时撤回同意">
            Withdrawing consent at any time
          </li>
          <li data-eng="Requesting a copy of your personal data" 
              data-rus="Запрос копии ваших персональных данных" 
              data-uzb="Shaxsiy ma'lumotlaringiz nusxasini so'rash"
              data-zh="请求获取您的个人数据副本">
            Requesting a copy of your personal data
          </li>
        </ul>
        
        <p data-eng="To exercise your rights, contact us at globanceapp@gmail.com."
           data-rus="Чтобы воспользоваться своими правами, свяжитесь с нами по адресу globanceapp@gmail.com."
           data-uzb="O'z huquqlaringizdan foydalanish uchun bizga globanceapp@gmail.com orqali murojaat qiling."
           data-zh="要行使您的权利，请通过globanceapp@gmail.com与我们联系。">
          To exercise your rights, contact us at <a href="mailto:globanceapp@gmail.com">globanceapp@gmail.com</a>.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="6. International Data Transfers" 
            data-rus="6. Международная передача данных" 
            data-uzb="6. Xalqaro ma'lumot uzatishlari"
            data-zh="6. 国际数据传输">
          6. International Data Transfers
        </h2>
        
        <p data-eng="If you are located outside the country where our servers are hosted, please note that your data may be transferred and stored in countries that may have different data protection laws. We ensure all such transfers comply with applicable regulations."
           data-rus="Если вы находитесь за пределами страны, где размещены наши серверы, обратите внимание, что ваши данные могут быть переданы и храниться в странах, которые могут иметь другие законы о защите данных. Мы гарантируем, что все такие передачи соответствуют применимым нормам."
           data-uzb="Agar siz serverlarimiz joylashgan mamlakatdan tashqarida bo'lsangiz, sizning ma'lumotlaringiz boshqa ma'lumotlarni himoya qilish qonunlariga ega bo'lgan mamlakatlarga uzatilishi va saqlanishi mumkinligini unutmang. Bunday barcha uzatishlar tegishli qoidalarga mos kelishini ta'minlaymiz."
           data-zh="如果您位于我们服务器所在国家/地区以外的地方，请注意，您的数据可能会被传输并存储在可能具有不同数据保护法律的国家/地区。我们确保所有此类传输均符合适用法规。">
          If you are located outside the country where our servers are hosted, please note that your data may be transferred and stored in countries that may have different data protection laws. We ensure all such transfers comply with applicable regulations.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="7. Children's Privacy" 
            data-rus="7. Конфиденциальность детей" 
            data-uzb="7. Bolalar maxfiyligi"
            data-zh="7. 儿童隐私">
          7. Children's Privacy
        </h2>
        
        <p data-eng="Our services are not intended for children under the age of 13. We do not knowingly collect personal information from minors. If we become aware of such data, we will delete it immediately."
           data-rus="Наши услуги не предназначены для детей младше 13 лет. Мы заведомо не собираем личную информацию от несовершеннолетних. Если нам станет известно о таких данных, мы немедленно их удалим."
           data-uzb="Bizning xizmatlarimiz 13 yoshdan kichik bolalar uchun mo'ljallanmagan. Biz voyaga yetmagan shaxslardan shaxsiy ma'lumotlarni ataylab to'plamaymiz. Agar bunday ma'lumotlar haqida bilib qolsak, ularni darhol o'chirib tashlaymiz."
           data-zh="我们的服务不面向13岁以下的儿童。我们不会故意收集未成年人的个人信息。如果我们发现此类数据，我们将立即删除。">
          Our services are not intended for children under the age of 13. We do not knowingly collect personal information from minors. If we become aware of such data, we will delete it immediately.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="8. Third-Party Links and Integrations" 
            data-rus="8. Сторонние ссылки и интеграции" 
            data-uzb="8. Uchinchi tomon havolalari va integratsiyalari"
            data-zh="8. 第三方链接和集成">
          8. Third-Party Links and Integrations
        </h2>
        
        <p data-eng="Our App may contain links to external websites or services. We are not responsible for their privacy practices and encourage you to review their policies."
           data-rus="Наше Приложение может содержать ссылки на внешние веб-сайты или сервисы. Мы не несем ответственности за их политику конфиденциальности и рекомендуем вам ознакомиться с их политикой."
           data-uzb="Bizning ilovamizda tashqi veb-saytlar yoki xizmatlarga havolalar bo'lishi mumkin. Biz ularning maxfiylik amaliyoti uchun javobgar emasmiz va sizni ularning siyosatlarini ko'rib chiqishga taklif qilamiz."
           data-zh="我们的应用程序可能包含指向外部网站或服务的链接。我们不对他们的隐私做法负责，并鼓励您查看他们的政策。">
          Our App may contain links to external websites or services. We are not responsible for their privacy practices and encourage you to review their policies.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="9. Updates to This Privacy Policy" 
            data-rus="9. Обновления этой Политики конфиденциальности" 
            data-uzb="9. Ushbu maxfiylik siyosatiga yangilanishlar"
            data-zh="9. 本隐私政策的更新">
          9. Updates to This Privacy Policy
        </h2>
        
        <p data-eng="We may update this Privacy Policy from time to time. If we make significant changes, we will notify you via email or in-app notification. Please review this policy periodically for the latest information."
           data-rus="Мы можем время от времени обновлять эту Политику конфиденциальности. Если мы внесем существенные изменения, мы уведомим вас по электронной почте или через уведомление в приложении. Пожалуйста, периодически просматривайте эту политику для получения последней информации."
           data-uzb="Vaqti-vaqti bilan ushbu Maxfiylik siyosatini yangilashimiz mumkin. Agar biz muhim o'zgarishlar kiritsak, sizni elektron pochta orqali yoki ilova ichidagi bildirishnoma orqali xabardor qilamiz. Eng so'nggi ma'lumotlar uchun ushbu siyosatni vaqti-vaqti bilan ko'rib chiqing."
           data-zh="我们可能会不时更新此隐私政策。如果我们做出重大更改，我们将通过电子邮件或应用内通知通知您。请定期查看此政策以获取最新信息。">
          We may update this Privacy Policy from time to time. If we make significant changes, we will notify you via email or in-app notification. Please review this policy periodically for the latest information.
        </p>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <h2 data-eng="10. Contact Us" 
            data-rus="10. Свяжитесь с нами" 
            data-uzb="10. Biz bilan bog'laning"
            data-zh="10. 联系我们">
          10. Contact Us
        </h2>
        
        <p data-eng="If you have any questions or concerns about this Privacy Policy or your data, please contact:"
           data-rus="Если у вас есть какие-либо вопросы или опасения относительно этой Политики конфиденциальности или ваших данных, пожалуйста, свяжитесь с:"
           data-uzb="Agar sizda ushbu Maxfiylik siyosati yoki ma'lumotlaringiz haqida savollar yoki tashvishlar bo'lsa, iltimos, bog'laning:"
           data-zh="如果您对本隐私政策或您的数据有任何问题或疑虑，请联系：">
          If you have any questions or concerns about this Privacy Policy or your data, please contact:
        </p>
        
        <p data-eng="Globance Team<br>Email: globanceapp@gmail.com" 
           data-rus="Команда Globance<br>Электронная почта: globanceapp@gmail.com" 
           data-uzb="Globance jamoasi<br>Elektron pochta: globanceapp@gmail.com"
           data-zh="Globance团队<br>电子邮件: globanceapp@gmail.com">
          Globance Team<br>Email: <a href="mailto:globanceapp@gmail.com">globanceapp@gmail.com</a>
        </p>
      </div>

      <script nonce="${res.locals.nonce}">
        document.addEventListener('DOMContentLoaded', () => {
          document.getElementById('language-switch').addEventListener('change', function() {
            switchLanguage(this.value);
          });

          function switchLanguage(lang) {
            document.querySelectorAll('[data-eng]').forEach(el => {
              el.innerText = el.getAttribute(\`data-\${lang}\`);
              
              // Special handling for elements that contain links
              if (el.innerHTML.includes('globanceapp@gmail.com')) {
                const emailText = el.getAttribute(\`data-\${lang}\`);
                if (emailText.includes('globanceapp@gmail.com')) {
                  el.innerHTML = emailText.replace('globanceapp@gmail.com', '<a href="mailto:globanceapp@gmail.com">globanceapp@gmail.com</a>');
                }
              }
            });
          }
        });
      </script>
    </body>
    </html>
  `);
}

module.exports = { DeleteAccount, PrivatePolicy };
