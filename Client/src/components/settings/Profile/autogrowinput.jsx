import { useState, useRef, useEffect } from "react";
import '../settings.css';
import useOutsideClick from "../../../hooks/useOutsideClick";
import { toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

export default function AutoGrowInput({setChange}) {
  const axiosPrivate = useAxiosPrivate();
  const [name, setName] = useState("");
  const {auth,setAuth} = useAuth();
  const spanRef = useRef(null);
  const inputRef = useRef(null);
  const changeNameRef = useRef();

  const decode = auth?.accessToken
    ? jwtDecode(auth.accessToken)
    : undefined

  useEffect(() => {
    const span = spanRef.current;
    const input = inputRef.current;
    if (span && input) {
      // Add a small buffer (extra space)
      input.style.width = span.offsetWidth + 20 + "px";
    }
  }, [name]);

  const handleChange = (e) => {
    let text = e.target.value;

    // Remove spaces
    text = text.replace(/[^A-Za-z0-9]/g, ""); 

    // Limit to 12 characters
    if (text.length > 12) return;

    // Capitalize first letter
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    setName(text);
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input) input.focus();
  }, []);


  const submitchange = async() => {
    if(name.length < 3){
      toast.error('Name must contain atleast 3 letters.');
      setChange(false);
      return;
    }
    try {
      const response = await axiosPrivate.patch(`/users/${decode.UserInfo.id}`, {name});
      if (response.status === 200) {
        setAuth(prev =>({...prev,name:response.data.name}));
        setChange(false);
      }
    } catch (error) {
      if (!error?.response) {
        toast.error('no server response')
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Somthing went wrong');
      }
    }
  }

  useOutsideClick(changeNameRef, () => {
    submitchange();
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitchange();
    }
  };

  return (
    <div ref={changeNameRef} className="changeName-div">
      {/* Hidden span to measure text width */}
      <span ref={spanRef}>
        {name || " "}
      </span>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck="false"
        />
      
    </div>
  );
}
