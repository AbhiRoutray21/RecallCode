import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import "./forgotpassword.css";
import { useNavigate } from "react-router-dom";
import { axiosBase } from "../../api/customAxios";
import { useState } from "react";
import { Blurloader } from "../../loader/Loader";
import { toast } from "react-toastify";

const Forgotpassword = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const navigate = useNavigate();

  const onSend = async (formData) => {
    setLoading(true);
    try {
      const response = await axiosBase.post("/forgotpass", formData);
      if (response.status === 200) {
        toast.success(response.data.message);
      }
      navigate("/login")
    } catch (error) {
      if (!error?.response) {
        toast.error('no server response')
      } else if (error.response?.status === 429) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Somthing went wrong');
      }
    } finally{
      setLoading(false);
    }
    reset();
  };


  return (
    <div className="VF-page">
      <header>RecallCode</header>
      <div className="VF-container">
        <form className="VF-form" onSubmit={handleSubmit(onSend)}>
          <FaTimes className="VF-close-icon" title="Close" onClick={() => navigate('/login')} />

          <h2>Forgot password</h2>

          {/* Email */}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your register email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}

          {/* Buttons */}
          <div className="VF-form-buttons">
            <button type="submit" className="VF-btn">Send OTP</button>
          </div>

        </form>
      </div>
      {loading && <Blurloader/>}
    </div>
  );
};

export default Forgotpassword;
