import { useEffect, useState } from "react";
import axios from "axios";
import DocsPage from '../docsPage/docspage';

function Terms() {
    const [content, setContent] = useState("");

    useEffect(() => {
        (async () => {
            const res = await axios.get("/terms-and-conditions.md");
            if (res?.data) {
                setContent(res.data);
            }
      })(); 
    }, []);

    return (
        <DocsPage content={content}/>
    )
}

export default Terms;
