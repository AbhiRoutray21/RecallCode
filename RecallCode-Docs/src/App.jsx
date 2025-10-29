import './App.css';
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import About from './components/about/about';
import Privacy from './components/privacy/privacy';
import Terms from './components/terms.jsx/terms';

function App() {

  const location = useLocation();

  return (
    <div className='main-container'>
      <header className='mainHeader'>RecallCode</header>
      <div className='nav-links'>
        <NavLink 
          to={'/privacy-policy'} 
         className={({isActive}) =>
          "link" + (isActive ? " selected" : "")
        }>Privacy Policy</NavLink>
        <NavLink 
          to={'/'} 
          className={"link" + (location.pathname === '/'  ? " selected" : "")
        }>About</NavLink> 
        <NavLink 
          to={'/terms'} 
          className={({isActive}) =>
          "link" + (isActive ? " selected" : "")
        }>Terms and Conditions</NavLink>
      </div>
      <Routes>
          <Route path="/" element={<About/>} />
          <Route path="/privacy-policy" element={<Privacy/>} />
          <Route path="/terms" element={<Terms/>} />
      </Routes>

      <div className='copyright'>
        © 2025 RecallCode. All rights reserved.
      </div>
    </div> 
  )
}

export default App
