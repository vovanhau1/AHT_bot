const employees = require('../data/employees.json');
const {filter, each, get} = require('underscore');
let employee = {
    telegram: null,
    async getEmployeeInfoAndReplyChat(match, chatId) {
        let employeeInfo = filter(employees, employee => employee.name.toLowerCase().includes(match.toLowerCase()));
        if (employeeInfo.length == 0) {
            await employee.telegram.bot.sendMessage(chatId, "Xin lỗi không tìm được thông tin nhân viên!\nVui lòng kiểm tra lại!");
            return;
        }
        each(employeeInfo, async ({name, position, phone, email}) => { 
            let msg = [];
            msg.push('Tên: ' + name);
            msg.push('Chức vụ: ' + position);
            msg.push('Số điện thoại: ' + phone);
            msg.push('Email: ' + email);
            console.log(msg.join("\n"));
            await employee.telegram.bot.sendMessage(chatId, msg.join("\n"));
        });
    }
};

module.exports = employee;