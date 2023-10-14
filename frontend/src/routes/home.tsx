import { useContext, useEffect, useState } from "react";
import { post_data, get_data } from "../helpers/api"
import { Post } from "../components/post"
import { PostSchema } from "../schemas/postSchema";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import CreatePost from "../components/createPost"

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", _id:"", votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]);
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

  
  const posts_obj = [];
  for (let i = 0; i < posts.length; i++) {
    posts_obj.push(<li key={posts[i]._id} className="lg:w-3/5 sm:w-3/4 w-[90%]"><Post key={posts[i]._id} showLinkToPost={true} width="w-full" _id={posts[i]._id} title={posts[i].title} createdAt={posts[i].createdAt} votes_likes={posts[i].votes_likes} votes_dislikes={posts[i].votes_dislikes} body={posts[i].body} author={posts[i].author} user_vote={posts[i].user_vote} comment_length={posts[i].comment_length} comments={posts[i].comments}/> </li>);
  }
  return (loaded ? 
  <div>
    
    <ul className="flex flex-col space-y-3 justify-center items-center w-full">
      <li key={"submit"} className="lg:w-3/5 sm:w-3/4 w-[90%]"><CreatePost/></li>
      {posts_obj}
    </ul>
  </div>
  : <div><p>loading...</p></div>);
}

export default Home;
