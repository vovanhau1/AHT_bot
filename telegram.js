const TelegramBot = require('node-telegram-bot-api');
const {each} = require('underscore');
const allowuser = require('../data/allow_user.json');
const OpenAI = require('./OpenAI');


let telegram = {
    token: '5395185916:AAFCLTzan-Hgom6ux0Nj5BwVHXEBP277YZM',
    bot: null,
    a: [
        /\/start/,
        /\/help/,
    ],

    command: [
        /\/flight (.+)/,
        /\/info (.+)/,
        /\/thietbi (.+)/,
        /\/cd (.+)/,
        /\/ca ([0-9]{2}\/[0-9]{2}\/[0-9]{4})/,
        /\/arr (.+)/,
        /\/dep (.+)/,
        /\/sop (.+)/,
        /\/dnct (.+)/,


    ], // regular expression

    async listen(callback) {
        each(telegram.command, (command) => {
            telegram.bot.onText(command, (msg, match) => {
                const chatId = msg.chat.id;
                let hasPermission = telegram.checkPermission(msg.from.id, chatId);
                if (hasPermission == false) {
                    return;
                } 
                
                const resp = typeof match[1] == 'undefined' ? null : match[1];
                callback(chatId, resp, command);
            });
        });

        telegram.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            let hasPermission = telegram.checkPermission(msg.from.id, chatId);
            if (hasPermission == false) {
                return;
            }
            telegram.bot.sendMessage(
                msg.from.id, 
                "Xin chào "+msg.from.first_name+" "+msg.from.last_name+"!\nChào mừng bạn đến với AHT chatbot! Nơi tra cứu thông tin công ty AHT.\nĐể được trợ giúp xin gõ lệnh /help"
            );
        });

        telegram.bot.onText(/\/help/, (msg) => {
            const chatId = msg.chat.id;
            let hasPermission = telegram.checkPermission(msg.from.id, chatId);
            if (hasPermission == false) {
                return;
            }
            telegram.bot.sendMessage(msg.from.id, "-Gõ lệnh /info tên nhân viên: Để tra cứu thông tin nhân viên \n -Gõ lệnh /ca ngày/tháng/năm : Để tra cứu thông tin nhân sự đi ca,Vd: /ca 01/01/2022 \n -Gõ lệnh /flight số hiệu chuyến bay : Để tra cứu thông tin chuyến bay theo flightradar \n -Gõ lệnh /arr all,m,a,n :Để tra cứu thông tin tất cả chuyến bay đến hoặc theo ca làm việc \n -Gõ lệnh /dep all,m,a,n Để tra cứu tất cả thông tin chuyến bay đi hoặc theo ca làm việc \n -Gõ lệnh /sop tên sự cố :Để tra cứu thông tin quy trình xử lý sự cố \n -Gõ lệnh /thietbi tên thiết bị:Để tra cứu thông tin về thiết bị \n -Gõ lệnh /cd tên khu vực :Để tra cứu thông tin quản lý hệ thống Đội cơ điện theo khu vực \n -Gõ lệnh /dnct tên khu vực :Để tra cứu thông tin quản lý hệ thống Đội ĐNCT theo khu vực");
        });
            

        telegram.bot.on('message', (msg) => {
            let is_command = false;
            each([...telegram.command, ...telegram.a], (command) => {
                let regex = new RegExp(command);
                
                if ((String(msg.text).match(regex))) {
                    is_command = true;
                }
            })

            if (is_command) {
                return;
            }
            OpenAI.telegram = telegram.bot;
            OpenAI.askOpenAi(msg.text, msg.chat.id, msg.message_id);

        })
    },

    checkPermission(userid, chatId) {
        return true;
         //allow user list in 
        if (allowuser.includes(userid) === false) {
            console.log('user id: ', userid);
            telegram.bot.sendMessage(chatId, "Bạn không có quyền sử dụng bot này. Vui lòng liên hệ admin @lekaka1 để được hướng dẫn.");
            return false;
        }
        return true; 
    },

    init() {
        telegram.bot = new TelegramBot(telegram.token, {polling: true});
    }
};

module.exports = telegram;