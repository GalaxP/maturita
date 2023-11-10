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
import { Suspense } from "react";
import { lazyLoad } from "routes/lazyLoad";
import { Security } from "routes/account/security";

const Register = lazyLoad("routes/account/register")
const PostId = lazyLoad("components/postId", "PostId")
const Contact = lazyLoad("routes/contact", "Contact")

function App() {
  return (
    <>
        <AuthContextProvider>
          <LocalizationContextProvider>
            <Suspense fallback={<h1>loading...</h1>}>
              <Router>
                <Layout>
                <Routes>
                  <Route path='/' element={<Home />}></Route>
                  <Route path='account'>
                    <Route path='register' element={<Register/> }></Route>
                    <Route path='login' element={<Login/> }></Route>
                    <Route path='logout' element={<Logout/> } ></Route>
                    <Route path='edit' element={ <ProtectedRoute><Edit/></ProtectedRoute>} ></Route>
                    <Route path='security' element={ <ProtectedRoute><Security/></ProtectedRoute>} ></Route>
                  </Route>
                  <Route path="submit" element={<ProtectedRoute><Submit/></ProtectedRoute>}></Route>
                  <Route path="community/:community" element={<Community/>}></Route>
                  <Route path="/post/:postId" element={<PostId/>}></Route>
                  <Route path="/search" element={<Search/>}></Route>
                  <Route path="/contact" element={<Contact/>}></Route>

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
