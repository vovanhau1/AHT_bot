const flight = require('./modules/flight');
const employee = require('./modules/employee');
const mee = require('./modules/mee');
const shift = require('./modules/shift');
const telegram = require('./modules/telegram');
const arr = require('./modules/arr');
const dep = require('./modules/dep');
const ell = require('./modules/ell');
const sobb = require('./modules/sobb');
const thietbi = require('./modules/thietbi');

telegram.init();
telegram.listen(async (chatId, match, command) => {
    // callback get employee info
    if (String(command).includes('/info')) {
        employee.telegram = telegram;
        await employee.getEmployeeInfoAndReplyChat(match, chatId);
    }

    // callback get flight info
    if (String(command).includes('/flight')) {
        flight.telegram = telegram;
        await flight.getFlightInfoAndReplyChat(match, chatId);
    }

    // callback cd
    if (String(command).includes('/cd')) {
        mee.telegram = telegram;
        await mee.getMeeInfoAndReplyChat(match, chatId);
    }

    // callback ca
    if (String(command).includes('/ca')) {
        shift.telegram = telegram;
        await shift.getShiftInfoAndReplyChat(match, chatId);
    }

    // callback arr
    if (String(command).includes('/arr')) {
        arr.telegram = telegram;
        await arr.getArrInfoAndReplyChat(match, chatId);
    }

    // callback departure
    if (String(command).includes('/dep')) {
        dep.telegram = telegram;
        await dep.getDepInfoAndReplyChat(match, chatId);
    }
      // callback dnct
      if (String(command).includes('/dnct')) {
        ell.telegram = telegram;
        await ell.getEllInfoAndReplyChat(match, chatId);
    }
      // callback sop
      if (String(command).includes('/sop')) {
        sobb.telegram = telegram;
        await sobb.getSobbInfoAndReplyChat(match, chatId);
    }
     // callback thietbi
     if (String(command).includes('/thietbi')) {
        thietbi.telegram = telegram;
        await thietbi.getThietbiInfoAndReplyChat(match, chatId);
    }
});

