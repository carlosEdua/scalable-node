const err = require("../../../utils/error")
const { nanoid } = require("nanoid");
const auth = require("../auth");

const TABLE = 'user';

function userController(injectedStore){
    // set store
    let store = injectedStore;
    if(!store){
        store = require("../../../store/dummy");
    }


    async function listUsers(){
        return await store.list(TABLE);
    }


    async function getUserById(id){
        const user = await store.query(TABLE, {id});
        if(!user) throw err("user does not exist", 404);

        return user;
    }


    async function getUserByUsername(username){
        return await store.query(TABLE, {username});
    }


    // create user
    async function createUser(body){
        // don't create if already exist
        const user = await getUserByUsername(body.username);
        if(user) throw err('username is taken', 400);

        body.id = nanoid();

        await auth.saverUserAuthData(body, true);
        // just save password in auth table
        delete body.password 

        return await store.insert(TABLE, body);
    }

    async function updateUser(id, body){
        // update only if exist
        let user = await getUserById(id);
        if(!user) throw err('username does not exist', 404);

        // update user auth data, only if username or password is different
        if(body.username || body.password){
            await auth.saverUserAuthData({...body, id}, false);        
        }

        // ============================
        // TODO: improve the SQL update
        // ============================
        user = {
            ...user,
            ...body
        }
        delete user.password;

        return await store.update(TABLE, id, user);
    }


    async function deleteUser(id){
        return await store.remove(id);
    }

    async function followUser(user_from, user_to){
        return await store.insert(TABLE+'_follow', {
            user_from,
            user_to
        }); 
    }

    async function getFollowers(id){
        const join = { [TABLE]: 'user_to' };
        const query = { 'user_from': id };
        return await store.query(TABLE+'_follow', query, join, true);
    }


    return{
        listUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        followUser,
        getFollowers
    }
}

module.exports = userController;




