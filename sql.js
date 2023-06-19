// let mssql = require('mssql');
const mssql = require('mssql/msnodesqlv8')
let Sql = {
    options: {
       connectionString: 'Server=.;Database=DICA;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};',
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
            const pool = new mssql.ConnectionPool(Sql.options)

            // make sure that any items are correctly URL encoded in the connection string
            const connection = await pool.connect();
            return await pool.request();
          
        } catch (err) {
            console.log(err);
            return err;
        }
    },

    async query(value) {
        const request = await Sql.connect();
        if (request) {
            return await request.query(value);
        } else {
            return false;
        }
    }
};

module.exports = Sql;