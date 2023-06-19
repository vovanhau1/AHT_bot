const el = require('../data/el.json');
const {filter, each} = require('underscore');
let ell = {
    telegram: null,
    async getEllInfoAndReplyChat(match, chatId) {
        let ellInfo = filter(el, ell => ell.gate.toLowerCase().includes(match.toLowerCase()));
        if (ellInfo.length == 0){
        await ell.telegram.bot.sendMessage(chatId, "Xin lỗi không tìm thấy thông tin!\nXin vui lòng kiểm tra lại!");
        return;
        } 
        each(ellInfo, async ({gate, tudien,}) => {
            let msg = [];
            msg.push('Khu vực: ' + gate);
            msg.push('Tủ điện chiếu sáng: ' + tudien);
            console.log(msg.join("\n"));
            console.log("-----------------------\n");
            await ell.telegram.bot.sendMessage(chatId, msg.join("\n"));
        });
    }
};
module.exports = ell;