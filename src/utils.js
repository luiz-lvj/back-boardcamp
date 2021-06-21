import connection from './connectDb.js';

async function isAllowedName(tableName, name){
    try {
        const categories = await connection.query(`SELECT * from ${tableName}`);
        const rows = categories.rows;
        const notAllowedNames = rows.filter(category => {
            if(category.name === name){
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
        const notAllowedCpfs = await connection.query('SELECT cpf FROM customers WHERE cpf=$1', [cpf]);
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

function formatedTime(timestrap){
    const date = new Date(timestrap);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const strMonth = parseInt(month) > 9 ? month : '0' + month;
    const strDay = parseInt(day) > 9 ? day : '0' + day;
    const formated = `${year}-${strMonth}-${strDay}`;
    return formated;
}

export {isAllowedName, isAllowedCpf, isValidId, formatedTime}