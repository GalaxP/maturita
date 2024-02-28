import { JSXElementConstructor, ReactElement, ReactNode, useContext, useEffect, useState } from "react";
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
import { JSX } from "react/jsx-runtime";
import { Skeleton } from "components/ui/skeleton";

const Home = ({openNewsletter}: {openNewsletter: ()=>void}) => {
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<PostSchema[]>([{author:{id:"",displayName:"", avatar:"", provider: ""}, title:"", locked:false, createdAt: new Date(), body:"", _id:"", community: {name: "", avatar:""}, votes_likes:0, votes_dislikes:0, user_vote:0, comments:[], comment_length :0}]);
  const [error, setError] = useState();
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const [documentTitle, setDocumentTitle] = useDocumentTitle("Home")
  const [cursor, setCursor] = useState<string>()
  const [reachedEnd, setReachedEnd] = useState(false)
  const [fetching, setFetching] = useState(false)

  const depth = 3

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoaded(false)
    const controller = new AbortController();
    getPosts();
    
    return () => {
      controller.abort()
    }
  }, [auth?.isAuthenticated]);
  
  useEffect(()=> {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        if(fetching) return
        getPosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [getPosts])

  function getPosts() {
    setFetching(true)
    //setTimeout(() => {
      if(reachedEnd) return
      get_data("/postslist?depth="+depth+ (cursor ? ("&cursor="+cursor):""), {}, auth?.isAuthenticated).then((res)=>{
        if(res.data.length === 0) {setReachedEnd(true); setLoaded(true); return}
        if(!cursor) setPosts(res.data);
        else setPosts([...posts, ...res.data])
  
        setCursor(btoa(res.data[res.data.length-1]._id));
        setLoaded(true)
        setFetching(false)
      }).catch((err)=>{setError(err);console.log(err); setLoaded(true);setFetching(false)})
    //}, 2000);
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
  
  
  
  return ( /*loaded ?*/
  <div className="mt-6 anchor-none" onScrollCapture={(e)=>{console.log(e)}}>
    <div className="flex flex-row w-full justify-center"> 
      <ul className="w-11/12 lg:w-[650px] sm:w-11/12 space-y-2" onScroll={(e)=>console.log(e)}>
        {auth?.isAuthenticated &&<li key={"submit"} className="w-full"> <CreatePost/></li>}
        {posts.map((post) => {
          return <li key={post._id} className="w-full"><Post key={post._id} showLinkToPost={true} width="w-full" props={post}/> </li>
        })}
        { 
         fetching && !reachedEnd && [...Array(depth)].map((e, i) => 
                            <li className="w-full" key={i}> 
                                <Skeleton className="w-full h-36 rounded-md"/>
                            </li>  

                            )
        } 
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
          <CardHeader className="pb-2"><CardTitle>Useful links</CardTitle></CardHeader>
          <CardContent className="mt-2">
            <div className="flex flex-col">
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of service</Link>
            <a href="#newsletter" onClick={()=>{openNewsletter();localStorage.removeItem("newsletter");return false;}}>Newsletter</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  /*: <HomeSkeleton/>*/);
}

export default Home;
