function Form_0_uz(message, telegram) {
    const newMessage = `
${message.title !== '' ? `💻 <b>${message.title}</b>\n` : ''}
${message.description !== '' ? `📝 <b>Ma'lumot:</b> ${message.description}\n` : ''}
💲 <b>Maosh: kelishiladi</b>\n 
🕰 <b>Ish vaqti: 9:00-18:00</b>

🔴 Talablar: 
-Tajribli bo‘lsa yaxshi (tajribasiz bo‘la turib, kirishuvchan va o‘rganishni xohlovchilarga o‘zimiz o‘rgatamiz) 
-O‘zbek tilini bilishi
-Kirishimli va faol bo‘lishi 

${message.location !== '' ? `📍 <b>Manzil:</b> ${message.location}\n` : ''}
${message.phoneNumber !== '' ? `📞 <b>Murojaat uchun: ${message.phoneNumber}\n</b>` : ''}
🏢 <b>Kompaniya: ${telegram.companyName}\n</b> 
🌐 <b>Telegram:</b> ${telegram.telegram
            ? `<a href="https://t.me/${telegram.telegram}">${telegram.telegram}</a>\n`
            : ''}
🔗 <b>Link: ${telegram.link}</b> \n

🚀 <b>Qo'shimcha ma'lumot: ${telegram.additionalInfo}</b>\n

⚡ Telegram orqali rezyume qoldiring! 
`;

    return newMessage;
}

function Form_1_uz(message, telegram) {
    // console.log("message: ", message);
    const newMessage = `
    <b><i>TopishAI'ga qo'shiling: Ajoyib ish imkoniyati!</i></b>

    👋 <b>Assalomu alaykum!</b>

    ${message.title !== '' ? `💼<b>${message.title}</b>` : ''}
    ${message.description !== '' ? `📝 <b>Ma'lumot:</b> ${message.description}` : ''}
    ${message.phoneNumber !== '' ? `📞 <b>Telefon raqami:</b> ${message.phoneNumber}` : ''}
    ${message.location !== '' ? `📍 <b>Manzil:</b> ${message.location}` : ''}


    💲 <b>Maosh:</b> 3-15 mln + KPI

    🏢 <b>Kompaniya:</b> ${telegram.companyName}

    🕰 <b>Ish vaqti:</b> kelishiladi

    🧑‍💼 <b>Yosh:</b> 20-27

    🔴 <b>Talablar:</b>
    - Tajribli bo‘lsa yaxshi (tajribasiz bo‘la turib, kirishuvchan va o‘rganishni xohlovchilarga o‘zimiz o‘rgatamiz)
    - O‘zbek tilini bilishi
    - Kirishimli va faol bo‘lishi



    🌐 <b>Telegram:</b> <a href="https://t.me/HunterTeam_admin">@HunterTeam_admin</a>

    ⚡ <b>Link orqali rezyume qoldiring!</b>

    ➖➖➖➖➖➖➖➖➖➖➖

    <b>Bo‘sh ish o‘rni, reklama va rezyume joylash bo‘yicha murojaat:</b> <a href="https://t.me/l_mademoiselle">@l_mademoiselle</a>

    <b>Biz haqimizda</b>
    TopishAI innovatsiya va mukammallikka sodiq yetakchi AI kompaniyasidir. Bizning jamoamiz eng yuqori darajadagi AI yechimlarini yetkazib berishdan ishtiyoqmand. Bizga qo'shiling va muvaffaqiyat hikoyamizning bir qismi bo'ling!

    <b>Bizning Telegram kanalimizga qo'shiling:</b> <a href="https://t.me/topishai">TopishAI Telegram kanali</a>

    🚀 Bu imkoniyatni qo'ldan boy bermang! Yuqoridagi havolalarni bosing va TopishAI bilan karyerangizni boshlang!
    `;


    return newMessage;
}



module.exports = { Form_0_uz, Form_1_uz };
