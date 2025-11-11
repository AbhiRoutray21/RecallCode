import './App.css' // All layouts CSS and color palets are inside this..
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// Keep these as normal imports (needed everywhere or immediately)
import Homepage from "./components/homepage/homaepage.jsx";
import MainLayout from './Layouts/MainLayout.jsx';
import RequireAuth, { GoToHome } from './Layouts/RequiredAuth.jsx';
import PersistLogin from './Layouts/persistLogin.jsx';
import NoSuchPage from './components/noSuchPage.jsx';
import { Pageloader, PracticeSkeleton, QuestionsPage, SelectiveSkeleton } from './loader/Loader.jsx';

// Lazy load route-level components
const LoginForm = lazy(() => import('./components/loginPage/login.jsx'));
const SignupForm = lazy(() => import('./components/signupForm/SignupForm.jsx'));
const AuthLogout = lazy(() => import('./components/logout/authLogout.jsx'));
const OtpVerify = lazy(() => import('./components/otpverification/otpverification.jsx'));
const Forgotpassword = lazy(() => import('./components/forgotPassword/forgotpassword.jsx'));
const ChangePasswordForm = lazy(() => import('./components/forgotPassword/changepassword.jsx'));
const Practice = lazy(() => import('./components/practice/practice.jsx'));
const Selective = lazy(() => import('./components/selective/selective.jsx'));
const Challenge = lazy(() => import('./components/challenge/challenge.jsx'));
const TrialQues = lazy(() => import('./components/homepage/TrialQuestions/trialQuestions.jsx'));
const PracticeQues = lazy(() => import('./components/practice/practiceQues.jsx'));
const SelectiveQues = lazy(() => import('./components/selective/selectiveQues.jsx'));

export default function App() {

  const defaultTheme = localStorage.getItem("theme") || "Dark";
  document.documentElement.setAttribute("data-theme",defaultTheme);
  
  const user = Number(import.meta.env.VITE_USER_ID);

  return (
    <Routes>
      {/*---------------------------------------------------------*/}
      <Route element={<PersistLogin />}>
      
        <Route element={<MainLayout />}>
          {/* public routes */}
          <Route path="/" element={<Homepage />} />

          {/* private routes */}
          <Route element={<RequireAuth allowedRoles={[user]} />}>
            <Route path="/practice" element={
              <Suspense fallback={<PracticeSkeleton/>}><Practice /></Suspense>} 
            />
            <Route path="/selective" element={
              <Suspense fallback={<SelectiveSkeleton/>}><Selective /></Suspense>}
            />
            <Route path="/challenge" element={
              <Suspense fallback={<PracticeSkeleton/>}><Challenge /></Suspense>}
            />
          </Route>
        </Route>

        <Route path='/logout' element={
          <Suspense fallback={''}><AuthLogout /></Suspense>}
        />

        <Route element={<GoToHome />}>
          <Route path="practiceques/:language" element={
            <Suspense fallback={<QuestionsPage/>}><PracticeQues /></Suspense>}
          />
          <Route path="selectiveques/:language" element={
            <Suspense fallback={<QuestionsPage/>}><SelectiveQues/></Suspense>}
          />
        </Route>

      </Route>
      {/*---------------------------------------------------------*/}

      <Route path="/trial/:language" element={
        <Suspense fallback={<QuestionsPage/>}><TrialQues/></Suspense>} />

      <Route path="/login" element={
        <Suspense fallback={<Pageloader/>}><LoginForm /></Suspense>}/>
      <Route path="/signup" element={
        <Suspense fallback={<Pageloader/>}><SignupForm /></Suspense>} />

      {/* public + private routes */}
      <Route path="/forgot_password" element={
        <Suspense fallback={<Pageloader/>}><Forgotpassword /></Suspense>} />
      <Route path="/forgot_password/:resetId/:token" element={
        <Suspense fallback={<Pageloader/>}><ChangePasswordForm /></Suspense>} />

      {/* private routes */}
        <Route path="/otpverify" element={
          <Suspense fallback={<Pageloader/>}><OtpVerify /></Suspense>} />

      <Route path="/*" element={<NoSuchPage />}/>
    </Routes>
  );
}


