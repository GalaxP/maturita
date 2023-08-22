import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Home from './routes/home';
import Register from './routes/account/register'
import Login from './routes/account/login'
import { AuthContextProvider } from './components/shared/AuthContext';
import Logout from './routes/account/logout';
import Layout from "./components/shared/layout";

function App() {
  return (

      <AuthContextProvider>
        <Router>
          <Layout>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='account'>
              <Route path='register' element={<Register/> }></Route>
              <Route path='login' element={<Login layout="false" /> }></Route>
              <Route path='logout' element={<Logout/> } ></Route>
            </Route>
            <Route path='*' element={<h1>404</h1>}></Route>
          </Routes>
          </Layout>
        </Router>
      </AuthContextProvider>
  );
}

export default App;
