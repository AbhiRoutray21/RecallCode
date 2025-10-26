import '../settings.css';
import { IoMdArrowDropdown } from "react-icons/io";
import { RxDotFilled } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useRef, useState} from "react";
import useOutsideClick from '../../../hooks/useOutsideClick';
import { useNavigate } from 'react-router-dom';

export default function Theme({setSettingsPop}){
    const optionsBoxRef = useRef();
    const [colorOptions, setColorOptions] = useState(false);
    const [theme,setTheme] = useState(localStorage.getItem('theme') || 'Dark');
    useOutsideClick(optionsBoxRef, () => setColorOptions(false));
    const navigate = useNavigate();

    const dark = () => {
        setTheme('Dark');
        document.documentElement.setAttribute("data-theme", "Dark");
        localStorage.setItem("theme",'Dark');
    };
    const light = () => {
        setTheme('Light');
        document.documentElement.setAttribute("data-theme", "Light");
        localStorage.setItem("theme",'Light');
    };


    return (
        <div className='theme-box'>
            <div className='theme-box-header'>
                <div>Theme</div>
                <IoClose className='settings-closeicon' onClick={() => { setSettingsPop(false);navigate(location.pathname);}} />
            </div>
            <div className='theme-color'>
                <div>Color</div>
                <div className='theme-color-optionsDiv' style={colorOptions ? { pointerEvents: 'none' } : {}} onClick={() => setColorOptions(true)}>
                    <span>{theme} <IoMdArrowDropdown style={{ marginBottom: '-2px' }} /></span>
                </div>
                {colorOptions &&
                    <div ref={optionsBoxRef} className='theme-color-options'>
                        <div onClick={dark}><span>Dark</span>{theme === 'Dark' && <RxDotFilled style={{ scale: '1.7' }} />}</div>
                        <div onClick={light}><span>Light</span>{theme === 'Light' && <RxDotFilled style={{ scale: '1.7' }} />}</div>
                    </div>
                }
            </div>
        </div>
    )
}


