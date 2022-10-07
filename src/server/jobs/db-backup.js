const mysqldump = require('mysqldump')

const generarBackup = async() => {

        await mysqldump({
            connection: {
                host: 'seguridad-dt.czu5fzhmivzz.us-east-2.rds.amazonaws.com',
                user: 'dream_team',
                password: 'DreamTeam',
                database: 'drburger',
            },
            dumpToFile: './src/server/backups/db-backup.sql',
        });

}

module.exports = {
    generarBackup
}

