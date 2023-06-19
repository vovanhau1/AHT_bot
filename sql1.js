// let mssql = require('mssql');
const mssql = require('mssql/msnodesqlv8')
let Sql1 = {
    options: {
       connectionString: 'Server=.;Database=INFOFLIGHT;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};',
        // connectionString: 'Server=localhost,1433;Database=database;User Id=username;Password=password;Encrypt=true',
        //driver: 'msnodesqlv8',
         //server: 'PC-PC\HAU',
         //database: 'DICA',
        //options: {
           // trustedConnection: true
        // }
    },

    async connect() {
        try {
            const pool = new mssql.ConnectionPool(Sql1.options)

            // make sure that any items are correctly URL encoded in the connection string
            const connection = await pool.connect();
            return await pool.request();
          
        } catch (err) {
            console.log(err);
            return err;
        }
    },

    async query(value) {
        const request = await Sql1.connect();
        if (request) {
            return await request.query(value);
        } else {
            return false;
        }
    }
};

module.exports = Sql1;