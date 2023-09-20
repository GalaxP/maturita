import { useContext, useEffect, useState } from "react";
import { post_data, get_data } from "../helpers/api"
import { Post } from "../components/post"
import { PostSchema } from "../schemas/postSchema";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<PostSchema[]>([{author:"", title:"", createdAt: new Date(), body:"", _id:"", votes_likes:0, votes_dislikes:0, user_vote:0, comments:[]}]);
  const [error, setError] = useState();
  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    setLoaded(false)
    const controller = new AbortController();
    getAllPosts(controller);

    return () => {
      controller.abort()
    }
  }, []);

  function getAllPosts(controller: AbortController) {
    get_data("/postslist", {/*signal: controller.signal*/}, auth?.isAuthenticated).then((res)=>{
      setPosts(res.data);
      setLoaded(true)
    }).catch((err)=>{setError(err);console.log(err); setLoaded(true);})
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

    auth?.protectedAction(()=> {
      post_data("/post", formJson, {}, true).then((res)=>{
      if(res.status===200)
      {
        const controller = new AbortController();
        getAllPosts(controller);
        alert("success")
      }})
      .catch((err)=>{setError(err); alert("something has gone wrong. try again")})
    }, ()=> {navigate("/account/login")})
    //console.log(formJson.data);
  }
  const posts_obj = [];
  for (let i = 0; i < posts.length; i++) {
    posts_obj.push(<li key={posts[i]._id} className="w-full"><Link key={posts[i]._id} to={"/post/"+posts[i]._id} className="Link mx-auto"><Post key={posts[i]._id} _id={posts[i]._id} title={posts[i].title} createdAt={posts[i].createdAt} votes_likes={posts[i].votes_likes} votes_dislikes={posts[i].votes_dislikes} body={posts[i].body} author={posts[i].author} user_vote={posts[i].user_vote} comments={posts[i].comments}/></Link> </li>);
  }
  return (loaded ? 
  <div>
    <form method="post" onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label><br/>
      <input id="title" name="title"></input><br/>
      <label htmlFor="body">Body</label><br/>
      <input id="body" name="body"></input><br/>
      <input type="submit" value="submit"/>
    </form>
    <ul className="flex flex-col space-y-3 justify-center items-center w-full">
      {posts_obj}
    </ul>
  </div>
  : <div><p>loading...</p></div>);
}

export default Home;
