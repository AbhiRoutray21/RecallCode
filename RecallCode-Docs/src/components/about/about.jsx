import { useEffect, useState } from "react";
import axios from "axios";
import DocsPage from '../docsPage/docspage';

function About() {
    const [content, setContent] = useState("");

    useEffect(() => {
       (async () => {
            const res = await axios.get("/about.md");
            if (res?.data) {
                setContent(res.data);
            }
      })(); 
       
    },[]);

    return (
        <DocsPage content={content}/>
    )
}

export default About
