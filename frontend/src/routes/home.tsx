import { useContext, useEffect, useState } from "react";
import { post_data, get_data } from "../helpers/api"
import { Post } from "../components/post"
import { PostSchema } from "../schemas/postSchema";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { useDocumentTitle } from "hooks/setDocuemntTitle";
import CreatePost from "../components/createPost"
import GetAvatar from "helpers/getAvatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogContent, DialogTrigger} from "../components/ui/dialog";
import { CreateCommunityForm } from "components/forms/createCommunityForm";
import HomeSkeleton from "../components/skeleton/home";

const Home = ({openNewsletter}: {openNewsletter: ()=>void}) => {
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

  const createCommunity = (values: {description: string, name: string}) => {
    post_data("/community/create", {name: values.name, description: values.description}, {}, true)
    .then(()=>{
      navigate("/community/" + values.name)
    })
    .catch((err)=>{
      alert('something went wrong')
    })
  }
  
  const posts_obj = [];
  for (let i = 0; i < posts.length; i++) {
    posts_obj.push(<li key={posts[i]._id} className="w-full"><Post key={posts[i]._id} showLinkToPost={true} width="w-full" props={posts[i]}/> </li>);
  }
  return (loaded ? 
  <div className="mt-6">
    <div className="flex flex-row w-full justify-center"> 
      <ul className="w-11/12 lg:w-[650px] sm:w-11/12 space-y-2">
        {auth?.isAuthenticated &&<li key={"submit"} className="w-full"> <CreatePost/></li>}
        {posts_obj}
      </ul>
      <div className="w-[300px] hidden sm:hidden md:hidden lg:block ml-6 space-y-2">
        <Card>
            <CardHeader>
                <CardTitle>Home</CardTitle>
                <CardDescription>
                    This is your front page
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Button className="w-full mb-2" variant={"round"} onClick={()=>navigate("/submit")}>Create A Post</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant={"round_outline"}>Create A Community</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a new community</DialogTitle>
                      <DialogDescription>
                        Create a place for people with similiar interest.
                      </DialogDescription>
                    </DialogHeader>
                    <CreateCommunityForm handleSubmit={(e)=>createCommunity(e)} isLoading={false}/>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
        </Card>
        <Card className="sticky top-16">
          <CardHeader><CardTitle>Useful links</CardTitle></CardHeader>
          <CardContent className="mt-2">
            <div className="flex flex-col">
            <Link to="/contact">Contact Us</Link>
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms of service</Link>
            <a href="#newsletter" onClick={()=>{openNewsletter();localStorage.removeItem("newsletter");return false;}}>Newsletter</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  : <HomeSkeleton/>);
}

export default Home;
