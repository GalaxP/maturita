import { useContext, useEffect, useState } from "react";
import { post_data, get_data } from "../helpers/api"
import { Post } from "../components/post"
import { PostSchema } from "../schemas/postSchema";
import AuthContext from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<PostSchema[]>([{author:"", title:"", createdAt: new Date, body:"", _id:""}]);
  const auth = useContext(AuthContext);

  useEffect(() => {
    setLoaded(false)
    getAllPosts();
  }, []);

  function getAllPosts() {
    get_data("/postslist").then((res)=>{
      setPosts(res.data);
      setLoaded(true)
    }).catch((err)=>{setLoaded(true);console.log(err);})
  }

  async function handleSubmit(e:any) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);

    // Or you can work with it as a plain object:
    const formJson = Object.fromEntries(formData.entries());
    // You can pass formData as a fetch body directly:
    //fetch('http://localhost:8080/post', { method: form.method});

    console.log(post_data("/post", formJson, {}, true).then((res)=>{
      if(res.status===200)
      {
        alert("success")
        getAllPosts();
      }})
      .catch((err)=>{console.log(err)}))
    
    //console.log(formJson.data);
  }
  const posts_obj = [];
  for (let i = 0; i < posts.length; i++) {
    posts_obj.push(<Post key={posts[i]._id} title={posts[i].title} createdAt={posts[i].createdAt} body={posts[i].body} author={posts[i].author}/>);
  }
  return (loaded ? 
  <div>
    <form method="post" onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label><br/>
      <input id="title" name="title"></input><br/>
      <label htmlFor="body">Body</label><br/>
      <input id="body" name="body"></input><br/>
      <label htmlFor="author">Author</label><br/>
      <input id="author" name="author"></input><br/>

      <input type="submit" value="submit"/>
    </form>

    {posts_obj}
  </div>
  : <div><p>loading...</p></div>);
}

export default Home;
