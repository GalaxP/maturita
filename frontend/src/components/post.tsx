import { PostSchema } from "../schemas/postSchema";

const Post = ({title, body, author, createdAt}: PostSchema) => {
    return <>
        <h1>{title}</h1>
        <p>{new Date(createdAt).toLocaleDateString() + " " + new Date(createdAt).toLocaleTimeString()}</p>
        <p>{body}</p>
        <p>Submitted by: {author}</p>
        <hr/>
    </>
}

export {
    Post,
}