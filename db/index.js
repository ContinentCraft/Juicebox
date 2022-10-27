const { Client } = require('pg')
const client = new Client('postgres://localhost:5432/juicebox-dev')

async function getAllUsers(){
    const { rows } = await client.query(`SELECT id, username FROM users;`)
    return rows
}


// find out where this goes
getAllUsers: [
    { 
        id: 1,
        username: 'albert',
        name: 'Al Bert',
        location: 'Sidney, Australia',
        active: true
    },
    {
        id: 2,
        username: 'sandra',
        name: 'Just Sandra',
        location: "Ain't tellin'",
        active: true
    },
    {
        id: 3,
        username: 'glamgal',
        name: 'Joshua',
        location: 'Upper East Side',
        active: true
    }
]

async function createUser({
    username, 
    password, 
    name, 
    location
}){
    try{
        const { rows } = await client.query(`
        INSERT INTO users(username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
        `, [ "username", "password", "name", "location" ]);
        
        
        return rows;
    }
    catch(error){
        throw error;
    }
}



// find out where to put l8r
async function updateUser(id, fields = {}) {

    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const result = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id = ${ id }
            RETURNING *;
            `, Object.values(fields));

        return result;
    }   catch(error) {
        throw error;
    }
}



module.exports = {
    client, getAllUsers, createUser
}