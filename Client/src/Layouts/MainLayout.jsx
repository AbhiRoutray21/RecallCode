import { Outlet, useLocation,NavLink } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import LoginPopMessage from "../components/loginMessage/loginPop";
import Header from "../components/homepage/Header/header";
import { MainLayoutProvider } from "../context/MainLayoutContext";
import useAuth from "../hooks/useAuth";
const SessionExpire = lazy(() => import('../components/sessionExpire/expire'));
const SettingsPop = lazy(() => import('../components/settings/settings'));

/*helper*/
function getItemFromStorage(name) {
  const value = localStorage.getItem(name);
  if (value === null) return false;
  return value === 'true'; // will return true or false
}

export default function MainLayout() {
  const {expire} = useAuth();
  const [settingsPop, setSettingsPop] = useState(false);
  const {auth} = useAuth();
  const location = useLocation();
  const [consent, setConsent] = useState(() => getItemFromStorage('cookieConsent'));

  useEffect(() => {
      setSettingsPop(location.hash.startsWith("#settings"));
  }, [location.hash]);

  function comfirm(){
    setConsent(true);
    localStorage.setItem('cookieConsent',true);
  }

  return (
    <MainLayoutProvider>
      <div className="mainLayout-container">
        <Sidebar />

        <div className="mainLayout-content-container">
          {/* This is where nested routes render */}
          <Header />
          <Outlet />
        </div>

        {/* login popup box */}
        <LoginPopMessage />

        {/* cookie consent popup */}
        {auth?.accessToken && !consent &&
          <div className="privacy-notice-pop">
            <p>
              By continuing to use this website, you agree to our use of cookies.
              You can read our
              <NavLink to={'http://localhost:5174/privacy-policy'} target="_blank" rel="noopener noreferrer" className={'notice-link'}>Privacy Policy</NavLink> and <NavLink to={'http://localhost:5174/terms'} target="_blank" rel="noopener noreferrer" className={'notice-link'}>Terms & Conditions</NavLink> for more information.</p>
            <div onClick={comfirm}>Got it</div>
          </div>
        }

        {/* session expire popup */}
        {expire && (
          <Suspense fallback={''}>
            <SessionExpire />
          </Suspense>
        )}
    
        {/* settings popup */}
        {settingsPop && auth.accessToken && (
          <Suspense fallback={''}>
            <SettingsPop />
          </Suspense>
        )}

      </div>
    </MainLayoutProvider>
  );
}
