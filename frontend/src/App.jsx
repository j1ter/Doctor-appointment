import React, { useContext } from "react";
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChangePassword from "./pages/ChangePassword";
import Article from "./pages/Article";
import Articles from "./pages/Articles";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserMessages from "./components/UserMessages";
// hello
const App = () => {
  const { isAuthenticated, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <p className='text-lg text-gray-600'>Загрузка...</p>
      </div>
    );
  }
  return (
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/my-profile"
          element={isAuthenticated ? <MyProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-appointments"
          element={isAuthenticated ? <MyAppointments /> : <Navigate to="/login" />}
        />
        <Route
          path="/appointment/:docId"
          element={<Appointment />}
        />
        <Route
          path="/my-messages"
          element={isAuthenticated ? <UserMessages /> : <Navigate to="/login" />}
        />
        <Route
          path="/change-password"
          element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />}
        />
        <Route path='/articles' element={<Articles />}
        />
        <Route path='/articles/:id' element={<Article />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/my-profile" : "/login"} />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
// $2b$10$ctT0sveXTX1oH1dkwf2ppeya66ciKgYF2I6VCUtmrBOgg4bMXGTXm