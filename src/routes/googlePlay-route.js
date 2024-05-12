const router = require("express").Router();
const app = require("express");

function DeleteAccount(req, res) {
  res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>Delete Account - Play Market</title>
              <style nonce="${res.locals.nonce}">
                  body { font-family: Arial, sans-serif; padding-top: 150px;}
                  .error { color: red; }
                  .success { color: green; }
                  h2, p { text-align: center; }
                  form { margin-top: 20px; background: #f4f4f4; padding: 20px; border-radius: 5px; display:flex; flex-direction: column; width: 30%; flex-align: center;jusify-content: center; margin: 0 auto}
                  label, input, button { display: block; width: 100%; margin-bottom: 10px; }
                  input, button { padding: 10px; border: 1px solid #ccc; border-radius: 4px;  box-sizing: border-box;}
                  button { background-color: #4caf50; color: white; cursor: pointer; }
                  button:hover { background-color: #45a049; }
              </style>
          </head>
          <body>
              <h2>Delete Account</h2>
              <p>Enter your phone number and password to delete your account</p>
              <form id="deleteAccountForm">
                  <label for="phoneNumber">Phone Number (9-digit):</label>
                  <input type="text" id="phoneNumber" name="phoneNumber" pattern="\\d{9}" placeholder="123456789" required>
                  <label for="password">Password:</label>
                  <input type="password" id="password" name="password" required>
                  <button type="submit">Delete Account</button>
                  <p id="message"></p>
              </form>
              <script nonce="${res.locals.nonce}">
                  document.addEventListener('DOMContentLoaded', () => {
                      const form = document.getElementById('deleteAccountForm');
                      form.addEventListener('submit', function (e) {
                          e.preventDefault();
                          const phoneNumber = document.getElementById('phoneNumber').value;
                          const password = document.getElementById('password').value;
                          const formData = { phoneNumber:  phoneNumber, password: password };

                            fetch('http://localhost:8080/api/v1/google/deleteAccount', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(formData)
                          })
                          .then(response => {
                              if (!response.ok) throw new Error('Network response was not ok');

                              return response.json();
                          })
                          .then(data => {
                              document.getElementById('message').textContent = data.message || 'Account deleted successfully';
                              document.getElementById('message').className = 'success';
                              document.getElementById('phoneNumber').value = ""
                              document.getElementById('password').value = ""
                          })
                          .catch(error => {
                              console.error('There has been a problem with your fetch operation:', error);
                              document.getElementById('message').textContent = error.message;
                              document.getElementById('message').className = 'error';
                          });
                      });
                  });
              </script>
          </body>
          </html>
      `);

};

function PrivatePolicy(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Topish AI Privacy Policy</title>
      <style nonce="${res.locals.nonce}">
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
        }
        h1 {
          text-align: center;
        }
        ol {
          counter-reset: item;
        }
        li {
          margin-bottom: 10px;
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
          // opacity: 0;
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
    </select>
    <div class="arrow-icon"></div>
  </div>
      <h1 data-eng="Topish AI Privacy Policy" data-rus="Политика конфиденциальности Topish AI" data-uzb="Topish AI Maxfiylik Siyosati">Topish AI Privacy Policy</h1>
      <ol>
        <li data-eng="Topish AI is dedicated to assisting unemployed individuals by providing a platform to search and apply for jobs. This SERVICE is provided at no cost and is intended for use 'as is'. This page is to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information for anyone who decides to use our Service. By using our Service, you agree to the collection and use of information in relation to this policy. The Personal Information collected is used for connecting job seekers with potential employers and improving the Service."
          data-rus="Topish AI посвящен помощи безработным, предоставляя платформу для поиска и подачи заявлений на работу. ЭТА УСЛУГА предоставляется бесплатно и предназначена для использования 'как есть'. Эта страница информирует посетителей о наших политиках, связанных с сбором, использованием и раскрытием Личной информации для тех, кто решит использовать нашу Службу. Используя нашу Службу, вы соглашаетесь на сбор и использование информации в соответствии с этой политикой. Собранная личная информация используется для связи ищущих работу с потенциальными работодателями и для улучшения Службы."
          data-uzb="Topish AI ish topishni istagan shaxslarga yordam berishga bag'ishlangan, bu xizmatni qidirish va ishga kirish uchun platformani taqdim etadi. Bu XIZMAT bepul taqdim etiladi va 'boricha' ishlatilishi ko'zda tutilgan. Ushbu sahifa mehmonlarni shaxsiy ma'lumotlarni yig'ish, foydalanish va oshkor qilish bo'yicha siyosatlarimiz haqida xabardor qilish uchun mo'ljallangan. Bizning Xizmatimizdan foydalanish orqali siz ushbu siyosatga muvofiq ma'lumotlarni yig'ish va foydalanishga rozilik bildirasiz. Yig'ilgan shaxsiy ma'lumotlar ish izlovchilarni potentsial ish beruvchilar bilan bog'lash va Xizmatni yaxshilash uchun ishlatiladi.">
          Topish AI is dedicated to assisting unemployed individuals by providing a platform to search and apply for jobs.
        </li>


        <li data-eng="Information Collection and Use: For the operation of our service, we collect various types of information. This includes but is not limited to, your resume, contact details, and employment history to assist in the job search and application process. We may also collect technical data necessary to provide you with job notifications and recommendations. Our application may use third-party services that may collect information used to support and enhance the service."
        data-rus="Сбор и использование информации: Для работы нашего сервиса мы собираем различные типы информации. Это включает, но не ограничивается, вашим резюме, контактными данными и трудовой историей для помощи в процессе поиска работы и подачи заявлений. Мы также можем собирать технические данные, необходимые для предоставления вам уведомлений о работе и рекомендаций. Наше приложение может использовать услуги третьих сторон, которые могут собирать информацию, используемую для поддержки и улучшения сервиса."
        data-uzb="Ma'lumotlarni to'plash va foydalanish: Xizmatimizni amalga oshirish uchun biz turli xil ma'lumotlarni to'playmiz. Bu, sizning rezyumeingiz, aloqa ma'lumotlaringiz va ish bilan bog'liq tarixingiz kabi, lekin faqat shular bilan cheklanmagan, ish qidirish va ariza berish jarayonida yordam berish uchun zarur bo'lgan ma'lumotlarni o'z ichiga oladi. Shuningdek, sizga ish haqidagi bildirishnomalar va tavsiyalar bilan ta'minlash uchun zarur bo'lgan texnik ma'lumotlarni to'playmiz. Bizning ilovamiz xizmatni qo'llab-quvvatlash va takomillashtirish uchun ishlatiladigan ma'lumotlarni to'playdigan uchinchi tomon xizmatlaridan foydalanishi mumkin.">
        Information Collection and Use: For the operation of our service, we collect various types of information.
    </li>
    
    <li data-eng="Log Data: In case of an error in the app, we may collect data and information on your device called Log Data. This may include your IP address, device name, operating system version, app configuration during the use of our Service, time and date of your use of the Service, and other statistics."
    data-rus="Данные журнала: В случае возникновения ошибки в приложении мы можем собирать данные и информацию об устройстве, называемые данными журнала. Это может включать ваш IP-адрес, название устройства, версию операционной системы, конфигурацию приложения во время использования нашего Сервиса, время и дату использования Сервиса, а также другую статистику."
    data-uzb="Log ma'lumotlar: Agar ilovada xatolik yuz bersa, biz Log ma'lumotlar deb ataluvchi qurilmangizdagi ma'lumot va ma'lumotlarni to'plashimiz mumkin. Bu sizning IP manzilingiz, qurilma nomingiz, operatsion tizim versiyasi, xizmatdan foydalanish davridagi ilova konfiguratsiyasi, xizmatdan foydalanish vaqti va sanasi hamda boshqa statistikalarni o'z ichiga olishi mumkin.">
    Log Data: In case of an error in the app, we may collect data and information on your device called Log Data.
</li>

<li data-eng="Cookies: Our Service may use 'cookies' to enhance user experience. Cookies are sent to your browser from the websites you visit and are stored on your device's internal memory. You have the option to accept or refuse these cookies, and know when a cookie is being sent to your device."
    data-rus="Куки: Наш сервис может использовать файлы 'куки' для улучшения пользовательского опыта. Файлы 'куки' отправляются в ваш браузер с посещаемых вами веб-сайтов и хранятся во внутренней памяти вашего устройства. У вас есть возможность принять или отказаться от этих файлов 'куки', а также знать, когда файл 'куки' отправляется на ваше устройство."
    data-uzb="Cookies: Xizmatimiz foydalanuvchi tajribasini yaxshilash uchun 'cookies' deb ataladigan fayllardan foydalanishi mumkin. 'Cookies' fayllari siz tashrif buyuradigan veb-saytlardan brauzeringizga yuboriladi va qurilmangizning ichki xotirasida saqlanadi. Siz ushbu 'cookies' fayllarini qabul qilish yoki rad etish imkoniyatiga egasiz, shuningdek, qurilmangizga 'cookie' fayli yuborilganda bilib olasiz.">
    Cookies: Our Service may use "cookies" to enhance user experience.
</li>

<li data-eng="Service Providers: We may employ third-party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use the information for any other purpose."
    data-rus="Поставщики услуг: Мы можем нанимать третьи компании и отдельных лиц для облегчения нашего Сервиса, предоставления Сервиса от нашего имени, выполнения связанных с Сервисом услуг или для помощи нам в анализе использования нашего Сервиса. Эти третьи стороны имеют доступ к вашей личной информации только для выполнения этих задач от нашего имени и обязаны не разглашать и не использовать информацию в иных целях."
    data-uzb="Xizmat ko'rsatuvchi tashkilotlar: Biz xizmatimizni osonlashtirish, bizning nomimizdan xizmat ko'rsatish, xizmatga oid xizmatlarni bajarish yoki xizmatimiz qanday ishlatilishini tahlil qilishda yordam berish uchun uchinchi tomon kompaniyalari va shaxslarini yollashimiz mumkin. Ushbu uchinchi tomonlar sizning shaxsiy ma'lumotlaringizga faqat ushbu vazifalarni bizning nomimizdan bajarish uchun kirish huquqiga ega va boshqa maqsadlar uchun ma'lumotni oshkor qilmaslik yoki ishlatmaslik majburiyatiga ega.">
    Service Providers: We may employ third-party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used.
</li>


<li data-eng="Security: We value your trust in providing us with your Personal Information; hence, we strive to use commercially acceptable means of protecting it. However, no method of transmission over the internet or electronic storage is 100% secure."
    data-rus="Безопасность: Мы ценим ваше доверие, предоставленное нам с вашей личной информацией; следовательно, мы стремимся использовать коммерчески приемлемые средства для её защиты. Тем не менее, ни один метод передачи данных через интернет или электронное хранение не является 100% безопасным."
    data-uzb="Xavfsizlik: Biz sizning bizga shaxsiy ma'lumotlaringizni taqdim etishingizga bo'lgan ishonchingizni qadrlaymiz; shu sababli, uni himoya qilish uchun qabul qilingan tijorat usullaridan foydalanishga intilamiz. Biroq, internet orqali ma'lumotlarni uzatishning yoki elektron saqlashning hech qanday usuli 100% xavfsiz emas.">
    Security: We value your trust in providing us with your Personal Information; hence, we strive to use commercially acceptable means of protecting it.
</li>

<li data-eng="Links to Other Sites: Our Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. We advise you to review the Privacy Policy of every site you visit as we do not operate those external sites."
    data-rus="Ссылки на другие сайты: Наш сервис может содержать ссылки на другие сайты. Если вы перейдете по ссылке третьей стороны, вы будете направлены на этот сайт. Мы рекомендуем вам ознакомиться с политикой конфиденциальности каждого сайта, который вы посещаете, поскольку мы не управляем этими внешними сайтами."
    data-uzb="Boshqa saytlarga havolalar: Bizning xizmatimizda boshqa saytlarga havolalar bo'lishi mumkin. Agar siz uchinchi tomon havolasini bosgan bo'lsangiz, siz o'sha saytga yo'naltirilasiz. Biz tashqi saytlarni boshqarmasligimiz sababli, tashrif buyurgan har bir saytning maxfiylik siyosatini ko'rib chiqishingizni maslahat beramiz.">
    Links to Other Sites: Our Service may contain links to other sites.
</li>

<li data-eng="Children’s Privacy: Our Service does not specifically target children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers."
    data-rus="Конфиденциальность детей: Наш сервис не нацелен специально на детей младше 13 лет. Мы не собираем сознательно личную информацию от детей до 13 лет. Если мы узнаем, что собрали личные данные от детей без подтверждения согласия родителей, мы предпринимаем шаги для удаления этой информации с наших серверов."
    data-uzb="Bolalar maxfiyligi: Bizning xizmatimiz 13 yoshgacha bo'lgan bolalarni aniq nishonga olmaydi. Biz 13 yoshdan kichik bolalardan shaxsiy ma'lumotlarni bilib-bilib to'plamaymiz. Agar biz ota-onalar roziligisiz bolalardan shaxsiy ma'lumotlar to'plaganimizdan xabar topadigan bo'lsak, ushbu ma'lumotlarni serverlarimizdan olib tashlash choralari ko'riladi.">
    Children’s Privacy: Our Service does not specifically target children under the age of 13.
</li>
<li data-eng="Changes to This Privacy Policy: We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this page periodically for any changes."
    data-rus="Изменения в данной Политике конфиденциальности: Мы можем время от времени обновлять нашу Политику конфиденциальности. Мы будем уведомлять вас о любых изменениях, размещая новую Политику конфиденциальности на этой странице. Вам рекомендуется периодически пересматривать эту страницу на предмет наличия изменений."
    data-uzb="Ushbu Maxfiylik Siyosatidagi o'zgarishlar: Vaqti-vaqti bilan biz Maxfiylik Siyosatimizni yangilashimiz mumkin. Yangi Maxfiylik Siyosatini ushbu sahifada e'lon qilib, sizga har qanday o'zgarishlar haqida xabar beramiz. O'zgarishlar bo'yicha ushbu sahifani muntazam ko'rib chiqishingiz tavsiya etiladi.">
    Changes to This Privacy Policy: We may update our Privacy Policy from time to time.
</li>
<li data-eng="Contact Us: If you have any questions or suggestions about our Privacy Policy, please do not hesitate to contact us at ."
    data-rus="Свяжитесь с нами: Если у вас есть вопросы или предложения по поводу нашей Политики конфиденциальности, пожалуйста, не стесняйтесь обращаться к нам по адресу."
    data-uzb="Biz bilan bog'laning: Agar sizda Bizning Maxfiylik Siyosatimiz haqida savollar yoki takliflar bo'lsa, iltimos, bizning email manziliga bog'lanishdan tortinmang.">
    Contact Us: If you have any questions or suggestions about our Privacy Policy, please do not hesitate to contact us at.
</li> <a href="mailto:topishinfo@gmail.com">topishinfo@gmail.com</a>

      </ol>

      <script nonce="${res.locals.nonce}">
        document.addEventListener('DOMContentLoaded', () => {
          document.getElementById('language-switch').addEventListener('change', function() {
            switchLanguage(this.value);
          });

          function switchLanguage(lang) {
            document.querySelectorAll('[data-eng]').forEach(el => {
              el.innerText = el.getAttribute(\`data-$\{lang}\`);
            });
          }
        });
      </script>
    </body>
    </html>
  `);
}

module.exports = { DeleteAccount, PrivatePolicy };