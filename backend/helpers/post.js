const Post = require("../schemas/post")
const PostAction = require("../schemas/postAction")
const pick = require('../helpers/pick')
const Comment = require("../schemas/comment")

const getPostById = async (postId, authorized, userId) => {
    try {
        const _post = await Post.findById(postId)
        if(!_post) return null
        const votes_likes = await PostAction.find({postId: postId, direction: 1})
        const votes_dislikes = await PostAction.find({postId: postId, direction: -1})
        var userVote = "";
        if(authorized) {
            userVote = await PostAction.findOne({postId: postId, userId: userId})
        }
        
        const result = pick(_post._doc, "_id", "title", "body", "author", "createdAt")
        const comments_ids = _post.comments;
        var comments = [];

        for(let index = 0; index < comments_ids.length; index++) {
            const comment = await Comment.findOne({_id: comments_ids[index]._id, deleted: false})
            if(!comment) continue;
            const votes_likes = await PostAction.find({postId: comment._id, direction: 1})
            const votes_dislikes = await PostAction.find({postId: comment._id, direction: -1})
            var _result = { id: comment._id.toString(), body: comment.body, author: comment.author, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, createdAt: comment.createdAt, comments: await getAllComments(comment._id, authorized, userId) }

            if(authorized) {
                const _userVote = await PostAction.findOne({postId: comment._id, userId: userId})
                if(_userVote) _result.user_vote = _userVote.direction
            }

            comments[comments.length] = _result
        }

        if(userVote===""|| !userVote) return {...result, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, user_vote: null, comments: comments}
        return {...result, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, user_vote: userVote.direction, comments: comments}
    } catch (err) {
        return null
    }
}

const getAllComments = async (commentId, authorized, userId) => {
    var comments = []
    const parent_comment = await Comment.findOne({_id: commentId, deleted: false})
    if( parent_comment.comments.length === 0) return;

    for(let index = 0; index <  parent_comment.comments.length; index++) {
        const comment = await Comment.findOne({_id: parent_comment.comments[index]._id, deleted: false})
        if(!comment) continue;
        
        const votes_likes = await PostAction.find({postId: comment._id, direction: 1})
        const votes_dislikes = await PostAction.find({postId: comment._id, direction: -1})

        var child_comments = await getAllComments(comment._id)
        var result = { id: comment._id.toString(), body: comment.body, author: comment.author, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, createdAt: comment.createdAt, comments: child_comments }

        if(authorized) {
            const userVote = await PostAction.findOne({postId: comment._id, userId: userId})
            if(userVote) result.user_vote = userVote.direction
        }
        
        comments[comments.length] = result
    }
    //console.log(comments)
    return comments
}

module.exports = getPostById