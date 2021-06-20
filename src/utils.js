import connection from './connectDb.js';

async function isAllowedName(tableName, name){
    try {
        const categories = await connection.query(`SELECT * from ${tableName}`);
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

async function isAllowedCpf(cpf){
    try{
        const notAllowedCpfs = await connection.query('SELECT cpf FROM costumers WHERE cpf=$1', [cpf]);
        if(notAllowedCpfs.rows.length !== 0){
            return false;
        }
        return true;
    } catch{
        return false;
    }
}

async function isValidId(tableName, idNumber){
    try{
        const elements = await connection.query('SELECT id FROM $1 WHERE id=$2', [tableName, idNumber]);
        if(elements.rows.length <= 0){
            return false;
        }
        return true;
    } catch{
        return false;
    }
}

export {isAllowedName, isAllowedCpf, isValidId}