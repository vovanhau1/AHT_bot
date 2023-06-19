const thietbii = require('../data/thietbii.json');
const {filter, each} = require('underscore');
let thietbi = {
    telegram: null,
    async getThietbiInfoAndReplyChat(match, chatId) {
        let thietbiInfo = filter(thietbii, thietbi => thietbi.ten.toLowerCase().includes(match.toLowerCase()));
       if (thietbiInfo.length == 0){
        await thietbi.telegram.bot.sendMessage(chatId, "Xin lỗi không tìm được thông tin!\nVui lòng kiểm tra lại!");
        return;
       }
        each(thietbiInfo, async ({ten, thongtin}) => {
            let msg = [];
            msg.push('Tên: ' + ten);
            msg.push('Thông số: ' + thongtin);
            console.log(msg.join("\n"));
            console.log("-----------------------\n");
            await thietbi.telegram.bot.sendMessage(chatId, msg.join("\n"));
        });
    }
};

module.exports = thietbi;