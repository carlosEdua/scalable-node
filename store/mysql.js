const mysql = require("mysql");
const config = require("../config");
const asyncMysql = require("./asyncMysql");

const dbConfig = {
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
}

let connection;
let asyncDB;

function handleConnection() {
    connection = mysql.createConnection(dbConfig);

    connection.connect( err => {
        if(err){
            console.error('[db error]', err);
            // try to connect again
            setTimeout( handleConnection, 2000);
        }else{
            console.log('mysql db connected');
            asyncDB = asyncMysql(connection);
        }
    })

    connection.on('error', err => {
        console.error('[de error]', err);
        if(err.code === 'PROTOCOL CONNECTION LOST'){
            // try again if is network error
            handleConnection();
        }
        else{
            throw err;
        }
    })
}


handleConnection();

// ===== crud functions =====

async function list(table){
    const q = `SELECT * FROM ${table}`;
    return await asyncDB.query(q);
} 

async function get(table, id){
    const q = `SELECT * FROM ${table} WHERE id = ${id}`;
    return await asyncDB.query(q);
} 

async function getBy(table, property, compareData){
    const q = `SELECT * FROM ${table} WHERE ${property}=?`;
    return await asyncDB.query(q, compareData);
}

async function query(table, query, join = null, toArray = false){
    let queryJoin = '';

    if(join){
        const key = Object.keys(join)[0];
        const value = join[key];
        queryJoin = `JOIN ${key} ON ${table}.${value} = ${key}.id`;
    }

    const q = `SELECT * FROM ${table} ${queryJoin} WHERE ${table}.?`;
    
    try {
        const data = await asyncDB.query(q, query);
        const length = data.length;
        // return first element
        if(length <= 1 && !toArray) return data[0];
        // return data array
        return data;

    } catch (err) { throw err }
}

async function insert(table, data){
    const q = `INSERT INTO ${table} SET ?`;
    return await asyncDB.query(q, data);
}

async function update(table, id, newData){
    const q = `UPDATE ${table} SET ? WHERE id=?`;
    return await asyncDB.query(q, [newData, id]);
}

async function remove(table, id){
    const q = `DELETE FROM ${table} WHERE id=${id}`;
    return await asyncDB.query(q);
}



module.exports = {
    list,
    get,
    getBy,
    query,
    insert,
    update,
    remove
}