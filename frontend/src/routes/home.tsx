import { useContext, useEffect, useState } from "react";
import { post_data, get_data } from "../helpers/api"
import { Post } from "../components/post"
import { PostSchema } from "../schemas/postSchema";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import CreatePost from "../components/createPost"
import GetAvatar from "helpers/getAvatar";

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:""}, title:"", createdAt: new Date(), body:"", _id:"", community: {name: "", avatar:""}, votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]);
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
  }, [auth?.isAuthenticated]);

  function getAllPosts(controller: AbortController) {
    get_data("/postslist", {/*signal: controller.signal*/}, auth?.isAuthenticated).then((res)=>{
      setPosts(res.data);
      setLoaded(true)
    }).catch((err)=>{setError(err);console.log(err); setLoaded(true);})
  }

  
  const posts_obj = [];
  for (let i = 0; i < posts.length; i++) {
    posts_obj.push(<li key={posts[i]._id} className="w-11/12 lg:w-[700px] sm:w-11/12"><Post key={posts[i]._id} showLinkToPost={true} width="w-full" props={posts[i]}/> </li>);
  }
  return (loaded ? 
  <div className="mt-6">
    
    <ul className="flex flex-col space-y-2 justify-center items-center w-full">
      <li key={"submit"} className="w-11/12 lg:w-[700px] sm:w-11/12">{auth?.isAuthenticated && <CreatePost/>}</li>
      {posts_obj}
    </ul>
  </div>
  : <div><p>loading...</p></div>);
}

export default Home;
