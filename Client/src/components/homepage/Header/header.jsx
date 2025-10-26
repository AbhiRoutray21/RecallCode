import { useLocation, useNavigate } from 'react-router-dom';
import './header.css';
import useAuth from '../../../hooks/useAuth';
import { CgMenuLeftAlt } from "react-icons/cg";
import useMainLayoutContext from '../../../hooks/useMainLayoutContext';
import { MdErrorOutline } from "react-icons/md";

export default function Header() {
  const navigate = useNavigate();
  const {auth} = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const page = path.replace("/", "").charAt(0).toUpperCase() + path.slice(2)
  const {isSidebarOpen,setIsSidebarOpen,setSubInfo} = useMainLayoutContext();

  const showInfo = (pageName) =>{
    setSubInfo(prev => {
      const current = prev[pageName] || false;
      if (!current) {
        return { ...prev, [pageName]: true };
      }
      return { ...prev, [pageName]: false };
    });
  }

  return (
    <>
    <header className='mainHeader'>
        <CgMenuLeftAlt className="menu-icon" onClick={()=>setIsSidebarOpen(!isSidebarOpen)}/>
        <h2>{path==='/'
          ?'RecallCode'
          : page}
        </h2>
          {auth?.accessToken && path!=='/' && <MdErrorOutline className="Header-about-icon" onClick={()=>showInfo(page)}/>}
        {!auth?.accessToken &&
          <div className='header-btns'>
              <button className='header-login-btn' onClick={()=>navigate('/login')}>Login</button>
              <button className='header-signup-btn' onClick={()=>navigate('/signup')}>Signup</button>
          </div>
        }
    </header>
    </>
  );
}