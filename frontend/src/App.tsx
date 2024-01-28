import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Home from './routes/home';
import Login from './routes/account/login'
import { AuthContextProvider } from './contexts/AuthContext';
import Logout from './routes/account/logout';
import Layout from "./components/shared/layout";
import Edit from "./routes/account/edit";
import ProtectedRoute from "./helpers/protectedRoute";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Callback from "./routes/account/google/callback";
import { Toaster } from "./components/ui/toaster";
import Submit from "routes/submit";
import Community from "routes/community";
import { LocalizationContextProvider } from "contexts/LocalizationContext";
import { Search } from "routes/search";
import { Suspense, useEffect, useState } from "react";
import { lazyLoad } from "routes/lazyLoad";
import { Security } from "routes/account/security";
import User from "routes/user";
import HomeSkeleton from "components/skeleton/home";

const Register = lazyLoad("routes/account/register")
const PostId = lazyLoad("components/postId", "PostId")
const Contact = lazyLoad("routes/contact", "Contact")
const AdminRoute = lazyLoad("routes/adminRoute")
const TOS = lazyLoad("routes/termsOfService")
const PrivacyPolicy = lazyLoad("routes/privacyPolicy")

function App() {
  const [openNewsletter, setOpenNewsletter] = useState(false)

  useEffect(()=>{
    if(openNewsletter) setOpenNewsletter(false)
  }, [openNewsletter])
  return (
    <>
        <AuthContextProvider>
          <LocalizationContextProvider>
            <Suspense fallback={<HomeSkeleton></HomeSkeleton>}>
              <Router>
                <Layout openNewsletter={openNewsletter}>
                <Routes>
                  <Route path='/' element={<Home openNewsletter={()=>{setOpenNewsletter(true)}}/>}></Route>
                  <Route path='account'>
                    <Route path='register' element={<Register/> }></Route>
                    <Route path='login' element={<Login/> }></Route>
                    <Route path='logout' element={<Logout/> } ></Route>
                    <Route path='edit' element={ <ProtectedRoute><Edit/></ProtectedRoute>} ></Route>
                    <Route path='security' element={ <ProtectedRoute><Security/></ProtectedRoute>} ></Route>
                  </Route>
                  <Route path="submit" element={<ProtectedRoute><Submit/></ProtectedRoute>}></Route>
                  <Route path="community/:community" element={<Community/>}></Route>
                  <Route path="user/:userId" element={<User/>}></Route>
                  <Route path="/post/:postId" element={<PostId/>}></Route>
                  <Route path="/search" element={<Search/>}></Route>
                  <Route path="/contact" element={<Contact/>}></Route>
                  <Route path="/admin" element={<AdminRoute/>}></Route>

                  <Route path="/terms-of-service" element={<TOS/>}></Route>
                  <Route path="/privacy-policy" element={<PrivacyPolicy/>}></Route>

                  <Route path='google'>
                    <Route path='callback' element={<Callback/>}></Route>
                  </Route>
                  <Route path='*' element={<h1>404</h1>}></Route>
                </Routes>
                </Layout>
                
              </Router>
            </Suspense>
          </LocalizationContextProvider>
        </AuthContextProvider>
      <Toaster/>
      </>
  );
}

export default App;
