const fs = require('fs');
const Excel = require('exceljs');
const path = require('path');
const dayjs = require('dayjs');
let Sql = require('./sql.js'); 

let importCa = {
    pathFile: './data/imports/t11-cd.xlsx',
    department: 'Cơ Điện',
    startDate: '2022-11-01',
    sheetIndex: 2,
    startRow: 40,
    endRow: 40,
    empCol: 1,  
    dateColStart: 3,
    dateColEnd: 32,

    async startImport() {  
        try {
            const stream = fs.createReadStream(this.pathFile);
            let workbook = new Excel.Workbook();
            const xlsx = await workbook.xlsx.read(stream);
            const worksheet = xlsx.getWorksheet(this.sheetIndex);
            let all = [];
            for (let i = this.startRow; i <= this.endRow; i++) {
                let row = worksheet.getRow(i);
                let rowData = row.values;
                let empName = rowData[this.empCol + 1];

                let date = 0;
                for (let j = this.dateColStart + 1; j <= this.dateColEnd + 1; j++) {
                    let dateFormat = dayjs(this.startDate).add(date, 'day').format('YYYY-MM-DD');
                    let ca = rowData[j];
                    console.log(`insert into dbo.CA (Fullname, Shiftcode, Shiftdate, Department) values (N'${empName}', '${ca}', '${dateFormat}', N'${this.department}')`);
                    await Sql.query(`insert into dbo.CA (Fullname, Shiftcode, Shiftdate, Department) values (N'${empName}', '${ca}', '${dateFormat}', N'${this.department}')`);
                    date++;
                }
            }

            console.log('import finished.');
        } catch (e) {
            console.log(e);
        }
    }
};

importCa.startImport();

module.exports = importCa;