import { useContext, useEffect, useState } from "react";
import { post_data, get_data } from "../helpers/api"
import { Post } from "../components/post"
import { PostSchema } from "../schemas/postSchema";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
declare var grecaptcha:any

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", _id:"", votes_likes:0, votes_dislikes:0, user_vote:0, comments:[]}]);
  const [error, setError] = useState();
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const [documentTitle, setDocumentTitle] = useDocumentTitle("Home")

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
    grecaptcha.ready(function() {
      grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {action: 'post'}).then(function(token:string) {
        auth?.protectedAction(()=> {
          post_data("/post", {...formJson, token: token}, {}, true).then((res)=>{
          if(res.status===200)
          {
            const controller = new AbortController();
            getAllPosts(controller);
            alert("success")
          }})
          .catch((err)=>{setError(err); alert("something has gone wrong. try again")})
        }, ()=> {navigate("/account/login")})
      })
    })
    //console.log(formJson.data);
    //<Link key={posts[i]._id} to={"/post/"+posts[i]._id} className="Link mx-auto block">
    //
  }
  const posts_obj = [];
  for (let i = 0; i < posts.length; i++) {
    posts_obj.push(<li key={posts[i]._id} className="lg:w-3/5 sm:w-3/4 w-[90%]"><Post key={posts[i]._id} showLinkToPost={true} width="w-full" _id={posts[i]._id} title={posts[i].title} createdAt={posts[i].createdAt} votes_likes={posts[i].votes_likes} votes_dislikes={posts[i].votes_dislikes} body={posts[i].body} author={posts[i].author} user_vote={posts[i].user_vote} comments={posts[i].comments}/> </li>);
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
