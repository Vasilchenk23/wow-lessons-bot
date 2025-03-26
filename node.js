const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();


const bot = new Telegraf(process.env.TOKEN);
const MANAGER_GROUP_CHAT_ID = process.env.CHAT_ID;

const userData = {};

bot.start((ctx) => {
  userData[ctx.from.id] = { subjects: [], classes: [] };
  return ctx.reply('Привіт! Як вас звати?');
});

bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  if (!userData[userId].name) {
    userData[userId].name = ctx.message.text;
    return ctx.reply(
      'Поділіться своїм номером телефону!',
      Markup.keyboard([
        Markup.button.contactRequest('Надіслати номер телефону'),
      ]).oneTime().resize()
    );
  }
});

bot.on('contact', (ctx) => {
  const userId = ctx.from.id;
  const phoneNumber = ctx.message.contact.phone_number;
  userData[userId].phone = phoneNumber;
  return ctx.reply('Дякуємо за надану інформацію! Оберіть предмет:',
    Markup.inlineKeyboard([
      Markup.button.callback('Математика', 'subj_math'),
      Markup.button.callback('Українська мова', 'subj_ukr'),
      Markup.button.callback('Англійська', 'subj_eng'),
      Markup.button.callback('Етика', 'subj_eth'),
      Markup.button.callback('Фізика', 'subj_phys'),
      Markup.button.callback('Історія', 'subj_hist'),
      Markup.button.callback('Всесвітня історія', 'subj_world'),
      Markup.button.callback('Історія України', 'subj_ua')
    ], { columns: 2 })
  );
});

bot.action('no_share', (ctx) => {
  const userId = ctx.from.id;
  userData[userId].phone = 'Не надано';
  return ctx.reply('Оберіть предмет:',
    Markup.inlineKeyboard([
      Markup.button.callback('Математика', 'subj_math'),
      Markup.button.callback('Українська мова', 'subj_ukr'),
      Markup.button.callback('Англійська', 'subj_eng'),
      Markup.button.callback('Етика', 'subj_eth'),
      Markup.button.callback('Фізика', 'subj_phys'),
      Markup.button.callback('Історія', 'subj_hist'),
      Markup.button.callback('Всесвітня історія', 'subj_world'),
      Markup.button.callback('Історія України', 'subj_ua')
    ], { columns: 2 })
  );
});

const subjectCallbackHandler = (subject) => (ctx) => {
  const userId = ctx.from.id;
  userData[userId].currentSubject = subject;
  return ctx.reply(
    'Оберіть клас:',
    Markup.inlineKeyboard([
      Markup.button.callback('1 клас', 'class_1'),
      Markup.button.callback('2 клас', 'class_2'),
      Markup.button.callback('3 клас', 'class_3'),
      Markup.button.callback('4 клас', 'class_4'),
      Markup.button.callback('5 клас', 'class_5'),
      Markup.button.callback('6 клас', 'class_6'),
      Markup.button.callback('7 клас', 'class_7')
    ], { columns: 3 })
  );
};

bot.action('subj_math', subjectCallbackHandler('Математика'));
bot.action('subj_ukr', subjectCallbackHandler('Українська мова'));
bot.action('subj_eng', subjectCallbackHandler('Англійська'));
bot.action('subj_eth', subjectCallbackHandler('Етика'));
bot.action('subj_phys', subjectCallbackHandler('Фізика'));
bot.action('subj_hist', subjectCallbackHandler('Історія'));
bot.action('subj_world', subjectCallbackHandler('Всесвітня історія'));
bot.action('subj_ua', subjectCallbackHandler('Історія України'));

const classCallbackHandler = (classNum) => (ctx) => {
  const userId = ctx.from.id;
  if (userData[userId].currentSubject) {
    userData[userId].subjects.push({ subject: userData[userId].currentSubject, class: classNum });
    delete userData[userId].currentSubject;
  }
  return ctx.reply(
    'Додати ще предмет чи завершити?',
    Markup.inlineKeyboard([
      Markup.button.callback('Додати предмет', 'add_subject'),
      Markup.button.callback('Завершити', 'finish')
    ])
  );
};

bot.action('class_1', classCallbackHandler('1'));
bot.action('class_2', classCallbackHandler('2'));
bot.action('class_3', classCallbackHandler('3'));
bot.action('class_4', classCallbackHandler('4'));
bot.action('class_5', classCallbackHandler('5'));
bot.action('class_6', classCallbackHandler('6'));
bot.action('class_7', classCallbackHandler('7'));

bot.action('add_subject', (ctx) => {
  return ctx.reply(
    'Оберіть предмет:',
    Markup.inlineKeyboard([
      Markup.button.callback('Математика', 'subj_math'),
      Markup.button.callback('Українська мова', 'subj_ukr'),
      Markup.button.callback('Англійська', 'subj_eng'),
      Markup.button.callback('Етика', 'subj_eth'),
      Markup.button.callback('Фізика', 'subj_phys'),
      Markup.button.callback('Історія', 'subj_hist'),
      Markup.button.callback('Всесвітня історія', 'subj_world'),
      Markup.button.callback('Історія України', 'subj_ua')
    ], { columns: 2 })
  );
});

bot.action('finish', (ctx) => {
  const userId = ctx.from.id;
  const data = userData[userId];
  const subjectsList = data.subjects.map(s => `${s.subject} (клас ${s.class})`).join(', ') || 'не вибрано';

  const managerMsg = `Нова заявка:
Ім'я: ${data.name}
Нікнейм: @${ctx.from.username || 'не вказано'}
Предмети: ${subjectsList}
Номер телефону: ${data.phone}`;

  bot.telegram.sendMessage(MANAGER_GROUP_CHAT_ID, managerMsg);

  return ctx.reply(
    "Дякуємо, ваша заявка надіслана. З вами скоро зв'яжуться!"
  );
});

bot.launch().then(() => {
  console.log('Бот запущений');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
