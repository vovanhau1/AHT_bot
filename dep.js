const {each} = require('underscore');
const axios = require('axios');
var DomParser = require('dom-parser');
const dayjs = require('dayjs');
var timezone = require('dayjs/plugin/timezone');
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

let Dep = {

    isTomorrow: false,
    currentTime: '00:00',

    apiUrl: 'https://danangairportterminal.vn/umbraco/surface/flight/departure',
    telegram: null,
    async getDepInfoAndReplyChat(match, chatId) {
        this.today = dayjs().format('YYYY-MM-DD');
        this.tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
        this.currentTime = '00:00';
        this.isTomorrow = false;

        let result;
        let matchType = match.toUpperCase();
        if (matchType == 'A' || matchType == 'M' || matchType == 'N') {
            result = await Dep.getDepInfoByTime(match);
        } else {
            result = await Dep.getDepInfo(match);
        }
        let msg = [];
        for (let index in result) {
            let depItem = result[index];

            msg.push(`${result.length > 1 ? (++index + '.') : '.'} 
    - Số hiệu chuyến bay: ${depItem.flightNumber}
    - Lịch trình: ${depItem.schedule}
    - Giờ mở quầy: ${depItem.startounters}
    - Giờ đóng quầy: ${depItem.endounters}
    - Quầy thủ tục: ${depItem.checkInCounters}
    - Gate: ${depItem.gate}` +
`${(matchType == 'A' || matchType == 'M' || matchType == 'N' || matchType == 'ALL') ? '' : 
`
    - Giờ đi dự kiến: ${depItem.schedule}
    - Giờ đi thực tế: ${depItem.revised}
    - Trạng thái: ${depItem.status}
    
    `}`);


            if (index % 10 == 0) {
                await Dep.telegram.bot.sendMessage(chatId, msg.join("\n"));
                msg = [];
            }
        }
       
        if (msg.length) {
            await Dep.telegram.bot.sendMessage(chatId, msg.join("\n"));
        } else {
            await Dep.telegram.bot.sendMessage(chatId, "Không tìm thấy dữ liệu.");
        }
    },
    
    async getDepInfoByTime(depType) {
        const todayTimestamp = new Date().getTime();
        const tomorrowTimestamp = new Date().getTime() + (24 * 60 * 60 * 1000);
        let today = new Date(todayTimestamp).toISOString().substring(0, 10);
        let tomorrow = new Date(tomorrowTimestamp).toISOString().substring(0, 10);

        let date1;
        let date2;
        depType = depType.toUpperCase();
        if (depType == 'M') {
            // 7h => 14h
            date1 = today + ' 07:00:00';
            date2 = today + ' 14:00:00';
        } else if (depType == 'A') {
            // 14h => 21h
            date1 = today + ' 14:00:00';
            date2 = today + ' 21:00:00';
        } else if (depType == 'N') {
            // 21 => 7h
            date1 = today + ' 21:00:00';
            date2 = tomorrow + ' 07:00:00';
        }

        const response = await axios.get(`${this.apiUrl}?${this.buildParams({startTime: date1, endTime: date2})}`);
        const html = response.data;
        const depData = this.parseHtml(html);
        return depData;
    },

    async getDepInfo(depCode) {
        const todayTimestamp = new Date().getTime();
        const tomorrowTimestamp = new Date().getTime() + (24 * 60 * 60 * 1000);
        let today = new Date(todayTimestamp).toISOString().substring(0, 10);
        let tomorrow = new Date(tomorrowTimestamp).toISOString().substring(0, 10);
        let startTime = today + ' 06:00';
        let endTime = tomorrow + ' 06:00';
        let flightNumber = false;
        if (depCode.toLowerCase() == 'all') {
            //
        } else {
            flightNumber = depCode;
        }

        const response = await axios.get(`${this.apiUrl}?${this.buildParams({startTime: startTime, endTime: endTime})}`);
        const html = response.data;
        const depData = this.parseHtml(html, flightNumber);
        return depData;
    },

    buildParams(data) {
        let baseData = {
            culturalInfor: 'en-gb',
            language: 'en',
        };

        const params = Object.assign(baseData, data);
        const urlParams = new URLSearchParams(params);
        return urlParams.toString();
    },

    parseHtml(html, flightNumber = false) {
        var parser = new DomParser();
        var dom = parser.parseFromString(html);
        const trTag = dom.getElementsByTagName('tr');
        
        let allData = [];
        each(trTag, function (tr, index) {
            let data = {};
            data.flightNumber = tr.getElementsByClassName('flights-code')[1].getElementsByClassName('image')[0].textContent.trim();
            let schedule = tr.getElementsByTagName('td')[0].textContent.trim().split(' ')[0].trim();
            let date = Dep.isTomorrowheck(schedule);
            Dep.currentTime = schedule;
            data.schedule = date + ' ' + schedule;

            data.revised = tr.getElementsByTagName('td')[1].textContent.trim();
            data.checkInCounters = tr.getElementsByTagName('td')[5].getElementsByTagName('span')[0].textContent.trim();
            data.gate = tr.getElementsByTagName('td')[6].textContent.trim();
            data.status = tr.getElementsByTagName('td')[7].textContent.trim();
            
            let scheduleTime = dayjs(data.schedule);
            data.startounters = scheduleTime.subtract(3, 'hour').format('YYYY-MM-DD HH:mm');
            data.endounters = scheduleTime.subtract(50/60, 'hour').format('YYYY-MM-DD HH:mm');
            if (flightNumber && data.flightNumber.includes(flightNumber) == false) {
                return;
            }
            allData.push(data);
        })


        return allData;
    },

    isTomorrowheck(time) {
        if (this.isTomorrow) {
            return this.tomorrow;
        }

        let date1 = dayjs(this.today + ' ' + time).unix();
        let date2 = dayjs(this.today + ' ' + this.currentTime).unix();

        let isTomorrow = false;
        if (date1 < date2) {
            isTomorrow = true;
            this.isTomorrow = true;
        }
        return isTomorrow ? this.tomorrow : this.today;
    }
};


module.exports = Dep;