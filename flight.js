const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')});
const {each, find} = require('underscore');

let flight = {
    telegram: null,
    endpointFindByCode: 'https://www.flightradar24.com/v1/search/web/find?limit=50&query=',
    endpointFindById: 'https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=',
    origin: 'https://www.flightradar24.com',
    options: {
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
        referrerPolicy: 'no-referrer'
    },

    async findByCode(flightCode) {
        const url = flight.endpointFindByCode + flightCode;
        const response = await fetch(url, flight.options);
        return await response.json();
    },

    async findById(flightId) {
        const url = flight.endpointFindById + flightId;
        const response = await fetch(url, flight.options);
        return await response.json();
    },

    async getFlightInfoAndReplyChat(flightCode, chatId) {
        const json = await flight.findByCode(flightCode);

        if (typeof json.results == 'object') {

            let hasLiveFlight = find(json.results, item => item.type == 'live');

            if (hasLiveFlight) {
                each(json.results, async (item) => {
                    if (item.type == 'live') {
                        let msg = [];
                        const flightId = item.id;
                        const flightInfo = await flight.findById(flightId);

                        msg.push(`Hãng: ${flightInfo.airline.name}`);
                        msg.push(`Số hiệu chuyến bay: ${item.detail.flight} ${flightInfo.aircraft.model.text}`);
                        msg.push(`Chặng bay: ${item.detail.route}`);
                        msg.push(`----------------`);
                        msg.push(`Giờ khởi hành dự kiến: ${flight.dateFormat(flightInfo.time.scheduled.departure)}`);
                        msg.push(`Giờ đến dự kiến: ${flight.dateFormat(flightInfo.time.scheduled.arrival)}`);

                        if (flightInfo.time.real.departure) {
                            msg.push(`Giờ khởi hành thực tế: ${flight.dateFormat(flightInfo.time.real.departure)}`);
                        } else {
                            msg.push(`Giờ khởi hành thực tế: —`);
                        }

                        if (flightInfo.time.estimated.arrival) {
                            msg.push(`Thời gian đến thực tế: ${flight.dateFormat(flightInfo.time.estimated.arrival)}`);
                        } else {
                            msg.push(`Thời gian đến thực tế: —`);
                        }
                        msg.push(`Show on map: ${flight.origin}/${item.detail.callsign}/${flightId}`);

                        await flight.telegram.bot.sendMessage(chatId, msg.join("\n"));
                        console.log(msg.join("\n"));
                        console.log("-----------------------\n");
                    }
                });
            } else {
                await flight.telegram.bot.sendMessage(chatId, `Không tìm thấy lịch trình chuyến bay ${flightCode}`);
            }
        } else {
            await flight.telegram.bot.sendMessage(chatId, `Không tìm thấy lịch trình chuyến bay ${flightCode}`);
        }
    },

    dateFormat(time) {
        let d = new Date(time * 1000),
            hour = '' + (d.getHours()),
            minutes = '' + (d.getMinutes()),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        if (hour.length < 2)
            hour = '0' + hour;
        if (minutes.length < 2)
            minutes = '0' + minutes;

        return hour + ':' + minutes + ' ' + [day, month, year].join('/');
    }
};

module.exports = flight;
