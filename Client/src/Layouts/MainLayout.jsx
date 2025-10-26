import { Outlet, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import LoginPopMessage from "../components/loginMessage/loginPop";
import Header from "../components/homepage/Header/header";
import { MainLayoutProvider } from "../context/MainLayoutContext";
import useAuth from "../hooks/useAuth";
const SessionExpire = lazy(() => import('../components/sessionExpire/expire'));
const SettingsPop = lazy(() => import('../components/settings/settings'));

export default function MainLayout() {
  const {expire} = useAuth();
  const [settingsPop, setSettingsPop] = useState(false);
  const {auth} = useAuth();
  const location = useLocation();

  useEffect(() => {
      setSettingsPop(location.hash.startsWith("#settings"));
  }, [location.hash]);

  return (
    <MainLayoutProvider>
      <div className="mainLayout-container">
        <Sidebar />

        <div className="mainLayout-content-container">
          {/* This is where nested routes render */}
          <Header />
          <Outlet />
        </div>

        <LoginPopMessage />

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
