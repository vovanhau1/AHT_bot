const sob = require('../data/sob.json');
const {filter, each} = require('underscore');

let sobb = {
    telegram: null,
    async getSobbInfoAndReplyChat(match, chatId) {
        let sobbInfo = filter(sob, sobb => sobb.suco.toLowerCase().includes(match.toLowerCase()));
       if (sobbInfo.length == 0){
        await sobb.telegram.bot.sendMessage(chatId, "Xin lỗi không tìm được thông tin!\nVui lòng kiểm tra lại!");
        return;
       }
        each(sobbInfo, async ({suco, quytrinh, steps}) => {
            let msg = [];
            msg.push('SOP: ' + suco);
            msg.push('Quy trình xử lý:');
            await sobb.telegram.bot.sendMessage(chatId, msg.join("\n"));
            if (steps) {
                for (const {step, img} of steps) {
                    await sobb.telegram.bot.sendMessage(chatId, step);
                    // await sobb.telegram.bot.sendDocument(chatId, pdf);
                    if (img) {
                        await sobb.telegram.bot.sendPhoto(chatId, img);
                    }
                }
            }
        });
    }
};

module.exports = sobb;