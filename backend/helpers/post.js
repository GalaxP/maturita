const Post = require("../schemas/post")
const PostAction = require("../schemas/postAction")
const pick = require('../helpers/pick')
const Comment = require("../schemas/comment")
const User = require("../schemas/user")
const mongoose = require('mongoose')
const Community = require("../schemas/community")
const { IsUserBanned, IsUserMod } = require("./account")

const getPostById = async (postId, authorized, userId, getComments) => {
    try {
        const _post = await Post.findById(postId)
        if(!_post) return null
        const votes_likes = await PostAction.find({postId: postId, direction: 1})
        const votes_dislikes = await PostAction.find({postId: postId, direction: -1})
        var userVote = "";
        if(authorized) {
            userVote = await PostAction.findOne({postId: postId, userId: userId})
        }
        
        const result = pick(_post._doc, "_id", "title", "body", "createdAt", "locked", "photos")
        const comm = await Community.findOne({name: _post.community})
        result.community = {name: _post.community, avatar: comm.avatar}
        
        const author = await User.findOne({uid:_post.author})
        if(!author || await IsUserBanned(_post.author)) return null
        
        result.author = {id: author.uid, displayName: author.displayName, avatar: author.provider==="google" ? author.google.picture : author.avatar, provider: author.provider, isMod: IsUserMod(userId, comm)}
        const comments_ids = _post.comments;
        var comments = [];
        var commentsLength = 0;

        for(let index = 0; index < comments_ids.length; index++) {
            const comment = await Comment.findOne({_id: comments_ids[index]._id, deleted: false})
            const author = await User.findOne({uid:comment.author})
            if(!comment|| await IsUserBanned(author.uid)) continue;
            commentsLength ++;

            if(getComments) {
                const votes_likes = await PostAction.find({postId: comment._id, direction: 1})
                const votes_dislikes = await PostAction.find({postId: comment._id, direction: -1})
                var _result = { id: comment._id.toString(), body: comment.body, author: comment.author, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, createdAt: comment.createdAt, comments: await getAllComments(comment._id, authorized, userId, true) }
                if(!author || await IsUserBanned(author.uid)) continue
                
                _result.author = {id: author.uid, displayName: author.displayName, avatar: author.provider==="google" ? author.google.picture : author.avatar}
        
                if(authorized) {
                    const _userVote = await PostAction.findOne({postId: comment._id, userId: userId})
                    if(_userVote) _result.user_vote = _userVote.direction
                }
                comments[comments.length] = _result
            } 
            if(!await IsUserBanned(comment.author)) commentsLength += await getAmountOfComments(comment._id) //note: not very optimized since this runs twice if you want to load all comments
        }
        result.comment_length = commentsLength
        const tagIndex = comm.tags.findIndex(x=>x.name === _post.tag)
        if(tagIndex !== -1) result.tag={
            name: comm.tags[tagIndex].name,
            color: comm.tags[tagIndex].color
        }

        comments.sort((a, b) => {
            return b.votes_likes - a.votes_likes;
        })
    
        if(getComments) result.comments = comments
        

        if(userVote===""|| !userVote) return {...result, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, user_vote: null}
        return {...result, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, user_vote: userVote.direction}
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

        if(await IsUserBanned(comment.author)) continue

        var child_comments = await getAllComments(comment._id, authorized, userId)
        var result = { id: comment._id.toString(), body: comment.body, author: comment.author, votes_likes: votes_likes.length, votes_dislikes: votes_dislikes.length, createdAt: comment.createdAt, comments: child_comments }
        const author = await User.findOne({uid:comment.author})
        if(!author) continue
        
        result.author = {id: author.uid, displayName: author.displayName, avatar: author.provider==="google" ? author.google.picture : author.avatar}

        if(authorized) {
            const userVote = await PostAction.findOne({postId: comment._id, userId: userId})
            if(userVote) result.user_vote = userVote.direction
        }
        
        comments[comments.length] = result
    }
    return comments
}

const getAmountOfComments = async (commentId) => {
    var amount = 0;
    const parent_comment = await Comment.findOne({_id: commentId, deleted: false})
    if( parent_comment.comments.length === 0) return 0;

    for(let index = 0; index <  parent_comment.comments.length; index++) {
        const comment = await Comment.findOne({_id: parent_comment.comments[index]._id, deleted: false})
        if(!comment || await IsUserBanned(comment.author)) continue;
        var child_comments = await getAmountOfComments(comment._id)

        amount += child_comments + 1;
    }
    return amount;
}

module.exports = getPostById