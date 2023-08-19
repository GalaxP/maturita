import { PostSchema } from "../schemas/postSchema";

const Post = ({title, body, author}: PostSchema) => {
    return <div className="post">
        <h1>{title}</h1>
        <p>{body}</p>
        <p>Submitted by: {author}</p>
        <hr/>
    </div>;
}

export {
    Post,
}