import pg from 'pg';

const { Pool } = pg;
const user = 'bootcamp_role';
const password = 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp';
const host = 'localhost';
const port_database = 5432;
const database = 'boardcamp';

const connection = new Pool({
    user,
    password,
    host,
    port_database,
    database
});

export default connection;