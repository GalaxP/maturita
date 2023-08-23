import { PostSchema } from "../schemas/postSchema";

const Post = ({title, body, author, createdAt}: PostSchema) => {
    return <div className="post">
        <h1>{title}</h1>
        <p>{new Date(createdAt).toLocaleDateString() + " " + new Date(createdAt).toLocaleTimeString()}</p>
        <p>{body}</p>
        <p>Submitted by: {author}</p>
        <hr/>
    </div>;
}

export {
    Post,
}