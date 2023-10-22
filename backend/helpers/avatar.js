require('dotenv').config()
const Avatar = require('../schemas/avatar')


class AvatarError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

const createDefaultAvatar = async(uid) => {
    const createAvatar = await import('@dicebear/core');
    const identicon = await import('@dicebear/collection');

    const avatar = createAvatar.createAvatar(identicon.identicon, {
        seed: uid,
        size: 40,
        scale: 70
    });
    await avatar.png().toFile(process.env.AVATAR_PATH+"/"+uid+".png").catch(()=>{throw new AvatarError("Unknown error occured.")})

    const avatarDb = new Avatar({
        filename: uid+".png",
        path: process.env.AVATAR_PATH+"/"+uid+".png",
        type: "user"
    });
    
    try {
        await avatarDb.save();
    } catch (error) {
        throw new AvatarError('Error saving avatar to the database.');
    }
}

const createDefaultCommunityAvatar = async(name) => {
    const createAvatar = await import('@dicebear/core');
    const identicon = await import('@dicebear/collection');

    const avatar = createAvatar.createAvatar(identicon.identicon, {
        seed: name,
        size: 40,
        scale: 70
    });
    await avatar.png().toFile(process.env.COMMUNITY_AVATAR_PATH+"/"+name+".png").catch(()=>{throw new AvatarError("Unknown error occured.")})

    const avatarDb = new Avatar({
        filename: name+".png",
        path: process.env.COMMUNITY_AVATAR_PATH+"/"+name+".png",
        type: "community"
    });
    
    try {
        await avatarDb.save();
        return process.env.COMMUNITY_AVATAR_PATH+"/"+name+".png"
    } catch (error) {
        throw new AvatarError('Error saving avatar to the database.');
    }
}

module.exports = {createDefaultAvatar, createDefaultCommunityAvatar}