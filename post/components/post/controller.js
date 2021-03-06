const err = require("../../../utils/error");
const { nanoid } = require("nanoid");
const PostObject = require("./model");
const TABLE = 'post';

function postController(injectedStore){
    // set store
    let store = injectedStore;
    if(!store){
        store = require("../../../store/dummy");
    }

    function getAllPosts(){
        return store.list(TABLE);    
    }

    function createPost(userId, postData){
        const post = PostObject({ userId, ...postData });
        post.id = nanoid();
        
        return store.insert(TABLE, post);    
    }

    return {
        createPost,
        getAllPosts
    }

}

module.exports = postController