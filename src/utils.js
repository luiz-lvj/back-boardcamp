import connection from './connectDb.js';

async function isAllowedName(name){
    try {
        const categories = await connection.query('SELECT * from categories');
        const rows = categories.rows;
        const notAllowedNames = rows.filter(categorie => {
            if(categorie.name === name){
                return true;
            }
            return false;
        });
        if(notAllowedNames.length !== 0){
            return false;
        }
        return true;
    }
    catch(err){
        return false;
    }
}

export {isAllowedName}