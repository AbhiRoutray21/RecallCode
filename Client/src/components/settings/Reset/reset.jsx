import '../settings.css';
import { IoClose } from "react-icons/io5";
import {useState,useEffect, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { toast } from 'react-toastify';
import Spinner from '../../../loader/spinner';
import languages from '../../../utility/languagesArrary';
import useMainLayoutContext from '../../../hooks/useMainLayoutContext';

export default function Reset({setSettingsPop}){
    const navigate = useNavigate();
    const {setProgressData} = useMainLayoutContext();
    const axiosPrivate = useAxiosPrivate();
    const [selectedLang, setSelectedLang] = useState([]);
    const [loading, setLoading] = useState(false);
    const controllerRef = useRef(null);

    const reset = async () => {
        if(selectedLang.length === 0){
            toast.error('Select atleast 1 language you want to reset.');
            return;
        };
        controllerRef.current = new AbortController();
        setLoading(true);
        try {
            const res = await axiosPrivate.post(`/resetProgress`,
                {languages:selectedLang},
                { signal: controllerRef.current.signal }
            );
            if (res.status === 200) {
                toast.success(res.data.message);
                setSelectedLang([]);
                setProgressData(res.data.userPracticeData);
            }
        } catch (error) {
            if (!error?.response) {
                toast.error('no server response');
                return;
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 404) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Somthing went wrong');
            }
        } finally {
            setLoading(false);
        }
    };
    // Cleanup for reset when component unmounts → cancel request
    useEffect(() => {
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);


    const handleChange = (langName) => {
        const check = selectedLang.includes(langName);
        if (check) {
            const remove = selectedLang.filter(l => l !== langName);
            setSelectedLang(remove);           
        } else {
            setSelectedLang(prev => [...prev, langName]); 
        }
    };

    const selectAll = () => {
        if(selectedLang.length >= languages.length){
            setSelectedLang([]);
        } else{
            languages.map(lang => {
                if(selectedLang.includes(lang.name)) return;
                return setSelectedLang(prev => [...prev,lang.name]);
            });
        }
    }

    return (
        <div className='settings-reset-box'>
            <div className='settings-reset-box-header'>
                <div>Reset</div>
                <IoClose className='settings-closeicon' onClick={() => { setSettingsPop(false);navigate(location.pathname);}} />
            </div>
            
            <p className='resetMessage'>Reset your practice data for any individual language or all languages at once. This will clear your progress and let you practice again from the beginning.</p>
            
            <div className='settings-resetSelect-div'>
                <div className='selectAll-resetbtn-div'>
                    <label className='resetSelect-AllBtn'>
                        <input 
                            type="checkbox"
                            checked={selectedLang.length === languages.length} 
                            onChange={() => selectAll()}
                        />
                        <span className="checkmark" />
                        <span className="SelectAll">Select All</span>
                    </label>

                    <div className='resetbtn'>
                        {loading && <Spinner size='20px' speed='1.7s' color="var(--text-color)"/>}
                        <button onClick={reset}>Reset</button>
                    </div>
                </div>

                <div className='reset-languageOptions-div'>
                    {languages.map((lang, i) => {
                        const isChecked = selectedLang.includes(lang.name);
                        return (
                            <label key={i} className='resetSelect-OptionsBtn'>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleChange(lang.name)}
                                />
                                <span className="checkmark" />
                                <span className="languageName">{lang.name}</span>
                            </label>
                        )
                    })}
                </div>     
            </div>
        </div>
    )
}


