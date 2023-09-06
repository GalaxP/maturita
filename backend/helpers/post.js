const Post = require("../schemas/post")
const PostAction = require("../schemas/postAction")
const pick = require('../helpers/pick')

const getPostById = async (postId, authorized, userId) => {
    try {
        const _post = await Post.findById(postId)
        if(!_post) return null
        const votes_likes = await PostAction.find({postId: postId, direction: 1})
        const votes_dislikes = await PostAction.find({postId: postId, direction: -1})
        var userVote = "";
        if(authorized) {
            userVote = await PostAction.find({postId: postId, userId: userId})
        }
        
        const result = pick(_post._doc, "_id", "title", "body", "author", "createdAt")
        if(userVote.length===0) return {...result, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, user_vote: null}
        return {...result, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, user_vote: userVote[0].direction}
    } catch (err) {
        return null
    }
}

const getAllPosts = async () => {

}

module.exports = getPostById