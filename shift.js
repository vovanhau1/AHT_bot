  
const {groupBy, sortBy, each} = require('underscore');
let Sql = require('./sql.js');

let shift = {
    telegram: null,

    groupIndex: {
        M: 1,
        A: 2,
        N: 3,
        AD: 4
    },

    group: {
        1: 'Ca Sáng',
        2: 'Ca Chiều',
        3: 'Ca Tối',
        4: 'Ca Hành Chính'
    },

    async getShiftInfoAndReplyChat(match, chatId) {
        const result = await shift.queryShiftList(match);
        let groups = shift.groupBy(result, 'Shiftcode');
        groups = shift.sortBy(groups);
        if (result.length == 0) {
            if (chatId) {
               await shift.telegram.bot.sendMessage(chatId, 'Không có thông tin');
            }
            console.log("Không có thông tin");
            return;
        }

        for (let groupIndex in groups) {
            groupIndex = parseInt(groupIndex);
            const group = groups[groupIndex];
            let msg = [];
            msg.push(shift.group[groupIndex + 1]);
            msg.push('---------');
            const groupDept = shift.groupBy(group, 'Department');
            each(groupDept, (dept, groupDeptIndex) => {
                msg.push(groupDeptIndex);
                each(dept, ({Fullname}, index) => {
                    msg.push(`${Fullname}`);
                });
                msg.push('---------');
            });
            if (chatId) {
                await shift.telegram.bot.sendMessage(chatId, msg.join("\n"));
            }
        };
    },

    groupBy(result, column) {
        return groupBy(result, column);
    },

    sortBy(result) {
        return sortBy(result, (item, index) => {
            return shift.groupIndex[index];
        });
    },

    async queryShiftList(date) {
        date = date.split('/');
        let whereDate = [];
        whereDate.push(date[1]);
        whereDate.push(date[0]);
        whereDate.push(date[2]);
        whereDate = whereDate.join('/');

        const result = await Sql.query(`select * from CA where cast ([Shiftdate] as date) = '${whereDate}' order by Shiftdate asc`); 
        return result.recordset;
    }
};

module.exports = shift;