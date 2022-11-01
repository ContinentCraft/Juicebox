const { Client } = require('pg')
const client = new Client('postgres://localhost:5432/juicebox-dev')




// stuff above here

const apiRouter = require('./api');
server.use('/api', apiRouter);

// stuff below here









const PORT = 3000;
const express = require('express');
const server = express();

server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});



async function getAllUsers(){
    const { rows } = await client.query(`SELECT id, username FROM users;`)
    return rows
}

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
        `, [ username, password, name, location ]);

        return rows;
    }
    catch(error){
        throw error;
    }
}

async function updateUser(id, fields = {}) {

    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows } = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id = ${ id }
            RETURNING *;
            `, Object.values(fields));

        return rows;
    }   catch(error) {
        throw error;
    }
}


async function getAllPosts() {
    try {
        const { rows } = await client.query(`SELECT id FROM posts;`)
        return rows
    } catch (error) {
      throw error;
    }
}

async function createPost({
    authorId,
    title,
    content
}){
    try{
        const { rows } = await client.query(`
        INSERT INTO posts( authorId, title, content) 
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
        `, [ authorId, title, content ]);
        return rows;
    }
    catch(error){
        throw error
    }
}

async function updatePost(id, fields = {
    title,
    content,
    active
}){
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try{
        const { rows } = await client.query(`
            UPDATE posts
            SET ${ setString }
            WHERE id = ${ id }
            RETURNING *;
            `, Object.values(fields));

        return rows;
    }
    catch(error){
        throw error
    }
}



module.exports = {
    client, getAllUsers, createUser, updateUser, getAllPosts, createPost,
    updatePost
}