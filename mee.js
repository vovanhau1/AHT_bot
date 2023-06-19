const me = require('../data/me.json');
const {filter, each} = require('underscore');

let mee = {
    telegram: null,
    async getMeeInfoAndReplyChat(match, chatId) {
        let meeInfo = filter(me, mee => mee.gate.toLowerCase().includes(match.toLowerCase()));
       if (meeInfo.length == 0){
        await mee.telegram.bot.sendMessage(chatId, "Xin lỗi không tìm được thông tin!\nVui lòng kiểm tra lại!");
        return;
       }
        each(meeInfo, async ({gate, ahu, evalator, firealarm, fire}) => {
            let msg = [];
            msg.push('Khu Vực: ' + gate);
            msg.push('AHU: ' + ahu);
            msg.push('Thang máy: ' + evalator);
            msg.push('Báo Cháy: ' + firealarm);
            msg.push('Trục chữa cháy: ' + fire);
            console.log(msg.join("\n"));
            console.log("-----------------------\n");
            await mee.telegram.bot.sendMessage(chatId, msg.join("\n"));
        });     
    }
};

module.exports = mee;