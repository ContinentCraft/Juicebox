const { client, getAllUsers, createUser, updateUser, createPost, updatePost, getPostById
} = require('./index')

async function dropTables(){
    try{
        console.log("Starting to drop tables...")
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `)
        console.log("Finished dropping tables...")
    }
    catch(error){
        console.error("ERROR dropping tables!")
        throw error
    }
}

async function createTables(){
    try{
        console.log("Starting to build tables...")
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                authorId INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE ("postId", "tagId"),
                active BOOLEAN DEFAULT true
            );
        `)
        console.log("Finished building tables...")
    }
    catch(error){
        console.error("ERROR building tables!")
        throw error
    }
    finally{
        client.end
    }
}

async function createTags(tagList) {
    console.log(tagList, "$")
    if (tagList.length === 0){
        return
    }

    // need something like: $1), ($2), ($3 
    const insertValues = tagList.map(
        (_, index) => `$${index +1}`).join('), (');

      // then we can use: (${ insertValues }) in our string template

      // need something like $1, $2, $3

    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');

    // then we can use (${ selectValues }) in our string template

  try {
    const { rows } = await client.query(`
        INSERT INTO tags(name)
        VALUES ($1), ($2), ($3)
        ON CONFLICT (name) DO NOTHING
        SELECT * FROM tags
        WHERE name
        IN ($1, $2, $3);
    `)
    return rows
    // insert the tags, doing nothing on conflict
    // returning nothing, we'll query after

    // select all tags where the name is in our taglist
    // return the rows from the query
  } catch (error) {
    throw error;
  }
}
    
    
async function createInitialTags() {
    try {
      console.log("Starting to create tags...");

  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);

      console.log(happy, sad, inspo, catman, "!^2")
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("ERROR creating tags!");
      throw error;
    }
  }



async function createInitialUsers(){
    try{
        console.log("Starting to create users...")
        const albert = await createUser({
            username: 'albert', 
            password: 'bertie99', 
            name: 'Al Bert',
            location: 'Sidney, Australia'
        })
        const sandra = await createUser({ 
            username: 'sandra', 
            password: '2sandy4me', 
            name: 'Just Sandra',
            location: "Ain't tellin'"
        })
        const glamgal = await createUser({ 
            username: 'glamgal', 
            password: 'soglam', 
            name: 'Joshua',
            location: 'Upper East Sude'
        })
        console.log(albert)
        console.log("Finished creating users")
    }
    catch(error){
        console.error("ERROR creating users!")
        throw error
    }
}

// async function getPostsByUser(userId){
//     try{
//         const { rows } = await client.query(`
//             SELECT * FROM posts WHERE authorId=${userId}
//         `)
//         return rows
//     }
//     catch(error){
//         throw error
//     }
// }

//asking to put getPostsByUser into index.js according to tutorial

async function createInitialPosts(){
    try{
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log("Starting to create posts...");
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ["#happy", "#youcandoanything"]
          });

        await createPost({
            authorId: sandra.id,
            title: "How does this work?",
            content: "Seriously, does this even do anything?",
            tags: ["#happy", "#worst-day-ever"]
          });

        await createPost({
            authorId: glamgal.id,
            title: "Living the Glam Life",
            content: "Do you even? I swear that half of you are posing.",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
          });
          
          console.log("Finished creating posts!");
        } catch (error) {
          console.log("Error creating posts!");
          throw error;
        }
      }



async function getUserById(userId){
    const { rows } = await client.query(`
        SELECT * FROM users
        WHERE id=${userId}
    `)
    delete rows[0].password
    if(rows==undefined){return null}
    const userPosts = await getPostsByUser(userId)
    rows[0].posts = JSON.stringify(userPosts)
    return {rows}
}

// tutorial is saying they want getUserById in index.js

async function testDB() {
    try {
        console.log("Starting to test database...");

        console.log("Calling getAllUsers");
        const users = await getAllUsers()
        console.log("Result:", users);

        console.log("Calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts")
        const posts = await getAllPosts()
        console.log("Result:", posts)

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        })
        console.log("Result:", updatePostResult)
        
        console.log("Calling getUserById with 1")
        const albert = await getUserById(1)
        console.log("Result:", albert)

        console.log("Finished database testing...");
    }
    catch (error){
        console.error("ERROR testing database!");
        throw error;
    }
}


async function getPostsByUser(userId) {
    try {
      const { rows: postIds } = await client.query(`
        SELECT id FROM posts 
        WHERE "authorId"=${ userId };
      `);
  
      const posts = await Promise.all(postIds.map(
        post => getPostById( post.id )
      ));
  
      return posts;
    } catch (error) {
      throw error;
    }
  }

  async function getAllPosts() {
    try {
      const { rows: postIds } = await client.query(`
        SELECT id FROM posts;
      `);
  
      const posts = await Promise.all(postIds.map(
        post => getPostById( post.id )
      ));
  
      return posts;
    } catch (error) {
      throw error;
    }
  }

  

async function rebuildDB(){
    try{
        client.connect()

        await dropTables()
        await createTables()
        await createInitialUsers()
        await createInitialPosts()
        await createInitialTags();
    }
    catch(error){
        console.error(error)
    }
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(()=>client.end())




