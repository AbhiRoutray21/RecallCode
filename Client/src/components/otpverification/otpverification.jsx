import { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams,useLocation } from 'react-router-dom';
import { axiosBase } from '../../api/customAxios';
import './otpverify.css';
import useAuth from '../../hooks/useAuth';
import { Blurloader } from '../../loader/Loader';
import { toast } from "react-toastify"
import Spinner from '../../loader/spinner';

const OtpVerify = () => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || sessionStorage.getItem('email');
  const [resendTimer, setResendTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [vloading, setvLoading] = useState(false);
  const navigate = useNavigate();
  const {setAuth} = useAuth();
  const location = useLocation();
  const cameFrom = location.state?.fromsignlog || sessionStorage.getItem("fromsignlog");

  sessionStorage.setItem('email',email);
  window.history.replaceState({}, "", window.location.pathname);

  useEffect(() => {
    if (!cameFrom) {
      sessionStorage.removeItem("fromsignlog");
      navigate("/", { replace: true }); // redirect home
      return;
    }
    sessionStorage.removeItem("fromsignlog");
  },[]);        

  // Countdown logic
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      setvLoading(true);
      const otp = fullOtp;
      try {
        const response = await axiosBase.post("/verifyOtp", { email, otp });
        if (response.status == 200) {
          sessionStorage.removeItem('email');
          const {accessToken,name,isNewUser} = response?.data;
          // G4 Signup tracking
					if (isNewUser && window.gtag) {
						window.gtag('event', 'signup_success', {
							method: 'email'
						});
					}
					// GA4 login tracking 
					if (window.gtag) {
						window.gtag('event', 'login_success', {
							method: 'email'
						});
					}
          setAuth({accessToken,name});
          toast.success(response.data.message);
          navigate('/');
        }
      } catch (error) {
        if (!error?.response) {
          toast.error('no server response');
        } else if (error.response?.status === 400) {
          toast.error(error.response.data.message);
        } else if (error.response?.status === 429) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Something went wrong');
        }
      } finally{
        setvLoading(false);
      }
    }
    else toast.error('Please enter all 6 digits');
  };

  const handleResend = async () => {
    if (resendTimer === 0) {
      setResendTimer(45); // cooldown seconds
    }
    setLoading(true);
    try {
      const response = await axiosBase.post("/resendOtp", { email });
      if (response.status == 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      if (!error?.response) {
        toast.error('no server response');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 429) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    } finally{
      setLoading(false);
    }

  };

  return (
    <div className='otp_page'>
      <header>RecallCode</header>
      <div className="otp-container">
        <h2>Verify OTP</h2>
        <p> Before login, we sent you an OTP to your email please verify yourself.</p>
        <div className="otp-inputs">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputRefs.current[idx] = el)}
            />
          ))}
        </div>
        <div className="otp-actions">
          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
          <button className="verify-btn" onClick={handleVerify}>
            {vloading ?<Spinner/> :" Verify OTP"}
          </button>
        </div>
      </div>
      {loading && <Blurloader/>}
    </div>
  );
};

export default OtpVerify;
