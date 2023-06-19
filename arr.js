const {each} = require('underscore');
const axios = require('axios');
var DomParser = require('dom-parser');
const dayjs = require('dayjs');
var timezone = require('dayjs/plugin/timezone');
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

let Arr = {
    telegram: null,
    
    isTomorrow: false,
    currentTime: '00:00',

    apiUrl: 'https://danangairportterminal.vn/umbraco/surface/flight/arrival',

    async getArrInfoAndReplyChat(match, chatId) {
        this.today = dayjs().format('YYYY-MM-DD');
        this.tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
        this.currentTime = '00:00';
        this.isTomorrow = false;

        let result;
        let matchType = match.toUpperCase();
        if (matchType == 'A' || matchType == 'M' || matchType == 'N') {
            result = await Arr.getArrInfoByTime(match);
        } else {
            result = await Arr.getArrInfo(match);
        }
        let msg = [];
        // each(result, async (arrItem, index) => {
            for (let index in result) {
                let arrItem = result[index];
            msg.push(`${result.length > 1 ? (++index + ".") : '.'} 
    - Số hiệu chuyến bay: ${arrItem.flightNumber}
    - Lịch trình: ${arrItem.schedule}
    - Giờ đến dự kiến: ${arrItem.schedule}
    - Giờ đến thực tế: ${arrItem.updated}
    - Nơi đến: ${arrItem.from}
    - Trạng thái: ${arrItem.status}`);

            if (index % 10 == 0) {
                await Arr.telegram.bot.sendMessage(chatId, msg.join("\n"));
                msg = [];
            }
        };
        
        if (msg.length) {
            await Arr.telegram.bot.sendMessage(chatId, msg.join("\n"));
        } else {
            await Arr.telegram.bot.sendMessage(chatId, "Không tìm thấy dữ liệu.");
        }
    },

    async getArrInfoByTime(arrType) {
        const todayTimestamp = new Date().getTime();
        const tomorrowTimestamp = new Date().getTime() + (24 * 60 * 60 * 1000);
        let today = new Date(todayTimestamp).toISOString().substring(0, 10);
        let tomorrow = new Date(tomorrowTimestamp).toISOString().substring(0, 10);

        let date1;
        let date2;
        arrType = arrType.toUpperCase();
        if (arrType == 'M') {
            // 7h => 14h
            date1 = today + ' 07:00:00';
            date2 = today + ' 14:00:00';
        } else if (arrType == 'A') {
            // 14h => 21h
            date1 = today + ' 14:00:00';
            date2 = today + ' 21:00:00';
        } else if (arrType == 'N') {
            // 21 => 7h
            date1 = today + ' 21:00:00';
            date2 = tomorrow + ' 07:00:00';
        }

        const response = await axios.get(`${this.apiUrl}?${this.buildParams({startTime: date1, endTime: date2})}`);
        const html = response.data;
        const arrData = this.parseHtml(html);
        return arrData;
    },

    async getArrInfo(arrCode) {
        const todayTimestamp = new Date().getTime();
        const tomorrowTimestamp = new Date().getTime() + (24 * 60 * 60 * 1000);
        let today = new Date(todayTimestamp).toISOString().substring(0, 10);
        let tomorrow = new Date(tomorrowTimestamp).toISOString().substring(0, 10);
        let startTime = today + ' 06:00';
        let endTime = tomorrow + ' 06:00';
        let flightNumber = false;
        if (arrCode.toLowerCase() == 'all') {
            //
        } else {
            flightNumber = arrCode;
        }

        const response = await axios.get(`${this.apiUrl}?${this.buildParams({startTime: startTime, endTime: endTime})}`);
        const html = response.data;
        const arrData = this.parseHtml(html, flightNumber);
        return arrData;
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
            data.flightNumber = tr.getElementsByClassName('flights-code')[2].getElementsByClassName('image')[0].textContent.trim();
            let schedule = tr.getElementsByTagName('td')[0].textContent.trim().split(' ')[0].trim();
            let date = Arr.isTomorrowheck(schedule);
            Arr.currentTime = schedule;
            data.schedule = date + ' ' + schedule;

            data.updated = tr.getElementsByTagName('td')[1].textContent.trim();
            if (data.updated) {
                data.updated =  date + ' ' + data.updated;
            }

            data.status = tr.getElementsByTagName('td')[5].textContent.trim();
            data.from = tr.getElementsByTagName('td')[2].textContent.trim().split(' ')[0].trim();
            
            if (flightNumber && data.flightNumber.includes(flightNumber) == false) {
                return;
            }

            //console.log(allData);
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

module.exports = Arr;