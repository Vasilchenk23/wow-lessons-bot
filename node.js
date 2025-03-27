const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TOKEN);
const MANAGER_GROUP_CHAT_ID = process.env.CHAT_ID;

const reviews = [
  "⭐ Відгук 1: WOW уроки допомогли мені стати кращим викладачем!",
  "⭐ Відгук 2: Дуже цікаві методики та сучасний підхід!",
  "⭐ Відгук 3: Рекомендую всім, хто прагне змін!"
];

const userData = {};

bot.start((ctx) => {
  const userId = ctx.from.id;
  userData[userId] = { step: 'greeting', subjects: [] };

  ctx.reply(
    "Доброго дня! Раді вітати вас в нашому проекті WOW уроки! 😊🚀\nЯкщо ви тут - це означає, що ви готові разом з нами змінювати викладання для дітей. Це дуже круто! Дякуємо вам за це! 🙌"
  );

  setTimeout(() => {
    ctx.reply(
      "🏛️ На ринку ми представлені з 1988 року. В цей рік було відкрито першу приватну школу «ліцей Гранд», яка, розвиваючись, перетворилася на освітню корпорацію «Гранд», флагманом якої зараз є онлайн-школа «ГрандЕкспо», та міжнародний дослідницько-впроваджувальний центр «Edu Future», який безупинно працює над впровадженням нових технологій шкільних уроків та загальної системи викладання в Україні і закордоном.\nОдним із найактуальніших напрямків роботи дослідницького центру стало створення таких уроків, які були б для дітей ненудними та невідразливими, а навпаки, захоплюючими та корисними. І нам це вдалося реалізувати саме в WOW уроках!"
    );
  }, 3000);

  setTimeout(() => {
    ctx.reply(
      "🎥 Для того, щоб більш детальніше поринутись і зрозуміти як працюють WOW уроки, ми пропонуємо вам ознайомитись з відео:",
      Markup.inlineKeyboard([
        Markup.button.url("ДЕТАЛЬНІШЕ", "https://www.youtube.com")
      ])
    );
    setTimeout(() => {
      ctx.reply("😊 Будь ласка, напишіть, як вас звати?");
      userData[userId].step = "await_name";
    }, 3000);
  }, 6000);
});

bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const step = userData[userId]?.step;
  
  if (step === "await_name") {
    userData[userId].name = ctx.message.text;
    userData[userId].step = "ask_teacher";
    return ctx.reply(
      "Для того щоб зрозуміти, що вас привело до нас, пропонуємо познайомитись.😊\nВи викладач?",
      Markup.inlineKeyboard([
        Markup.button.callback("Так", "teacher_yes"),
        Markup.button.callback("Ні", "teacher_no")
      ])
    );
  }
  
  if (step === "ask_position") {
    userData[userId].position = ctx.message.text;
    userData[userId].step = "await_phone";
    sendReviewsAndAskPhone(ctx, userId);
    return;
  }
  
  if (step === "await_phone") {
    userData[userId].phone = ctx.message.text;
    finalizeApplication(ctx, userId);
  }
});

bot.action("teacher_yes", (ctx) => {
  const userId = ctx.from.id;
  userData[userId].teacher = true;
  userData[userId].step = "ask_subjects";
  return ctx.reply(
    "📚 Які предмети ви викладаєте?",
    Markup.inlineKeyboard([
      Markup.button.callback("Математика", "subj_math"),
      Markup.button.callback("Українська мова", "subj_ukr"),
      Markup.button.callback("Англійська", "subj_eng"),
      Markup.button.callback("Біологія", "subj_bio"),
      Markup.button.callback("Хімія", "subj_chem"),
      Markup.button.callback("Фізика", "subj_phys"),
      Markup.button.callback("Історія", "subj_hist"),
      Markup.button.callback("Географія", "subj_geo"),
      Markup.button.callback("Література", "subj_lit"),
      Markup.button.callback("Інформатика", "subj_info"),
      Markup.button.callback("Мистецтво", "subj_art"),
      Markup.button.callback("Музика", "subj_music"),
      Markup.button.callback("Фізична культура", "subj_pe")
    ], { columns: 2 })
  );
});

bot.action("teacher_no", (ctx) => {
  const userId = ctx.from.id;
  userData[userId].teacher = false;
  userData[userId].step = "ask_position";
  return ctx.reply("👤 Вкажіть, будь ласка, вашу посаду:");
});

const subjectCallbackHandlerTeacher = (subject) => (ctx) => {
  const userId = ctx.from.id;
  userData[userId].subject = subject;
  userData[userId].step = "ask_classes";
  return ctx.reply(
    "Для яких класів ви викладаєте?",
    Markup.inlineKeyboard([
      Markup.button.callback("З 1 по 4", "class_range_1_4"),
      Markup.button.callback("З 5 по 9", "class_range_5_9"),
      Markup.button.callback("З 10 по 11", "class_range_10_11"),
      Markup.button.callback("З 5 по 11", "class_range_5_11")
    ], { columns: 2 })
  );
};

bot.action("subj_math", subjectCallbackHandlerTeacher("Математика"));
bot.action("subj_ukr", subjectCallbackHandlerTeacher("Українська мова"));
bot.action("subj_eng", subjectCallbackHandlerTeacher("Англійська"));
bot.action("subj_bio", subjectCallbackHandlerTeacher("Біологія"));
bot.action("subj_chem", subjectCallbackHandlerTeacher("Хімія"));
bot.action("subj_phys", subjectCallbackHandlerTeacher("Фізика"));
bot.action("subj_hist", subjectCallbackHandlerTeacher("Історія"));
bot.action("subj_geo", subjectCallbackHandlerTeacher("Географія"));
bot.action("subj_lit", subjectCallbackHandlerTeacher("Література"));
bot.action("subj_info", subjectCallbackHandlerTeacher("Інформатика"));
bot.action("subj_art", subjectCallbackHandlerTeacher("Мистецтво"));
bot.action("subj_music", subjectCallbackHandlerTeacher("Музика"));
bot.action("subj_pe", subjectCallbackHandlerTeacher("Фізична культура"));

const classCallbackHandlerTeacher = (classRange) => (ctx) => {
  const userId = ctx.from.id;
  userData[userId].classRange = classRange;
  userData[userId].step = "await_phone";
  sendReviewsAndAskPhone(ctx, userId);
};

bot.action("class_range_1_4", classCallbackHandlerTeacher("З 1 по 4"));
bot.action("class_range_5_9", classCallbackHandlerTeacher("З 5 по 9"));
bot.action("class_range_10_11", classCallbackHandlerTeacher("З 10 по 11"));
bot.action("class_range_5_11", classCallbackHandlerTeacher("З 5 по 11"));

function sendReviewsAndAskPhone(ctx, userId) {
  const reviewsMessage = reviews.join("\n\n");
  ctx.reply(
    "🙏 Дякуємо за ваші відповіді!\nПоки ми формуємо пропозицію для вас, пропонуємо ознайомитись з відгуками вчителів, які використовують наші WOW уроки:\n\n" +
      reviewsMessage
  );
  setTimeout(() => {
    ctx.reply(
      "📞 Будь ласка, залиште свій контактний номер телефону, щоб наш менеджер міг з вами звʼязатись та презентувати рішення під ваш запит.",
      Markup.keyboard([
        Markup.button.contactRequest("Надіслати номер телефону 📲")
      ]).oneTime().resize()
    );
  }, 3000);
}

bot.on('contact', (ctx) => {
  const userId = ctx.from.id;
  if (userData[userId]?.step === "await_phone") {
    userData[userId].phone = ctx.message.contact.phone_number;
    finalizeApplication(ctx, userId);
  }
});
function finalizeApplication(ctx, userId) {
  const data = userData[userId];
  let qualificationInfo = "";
  if (data.teacher) {
    qualificationInfo = `👩‍🏫 Викладач\n📚 Предмет: ${data.subject}\n🏫 Класи: ${data.classRange}`;
  } else {
    qualificationInfo = `👤 Посада: ${data.position}`;
  }
  const managerMsg = `🆕 Нова заявка:
👨‍👩‍👧‍👦 Ім'я: ${data.name || "не вказано"}
👤 Нікнейм: @${ctx.from.username || 'не вказано'}
${qualificationInfo}
📞 Номер телефону: ${data.phone}`;
  
  bot.telegram.sendMessage(MANAGER_GROUP_CHAT_ID, managerMsg);
  ctx.reply("✅ Дякуємо, ваша заявка надіслана. З вами скоро зв'яжуться! 😊");
}


bot.launch().then(() => {
  console.log('Бот запущений');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
