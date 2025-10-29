import './docspage.css';
import ReactMarkdown from "react-markdown";

function DocsPage({content}) {

    return (
        <div className='outer-container'>
            {content === ''
            ?<div className="markdown-container">
                <h1><div className='heading-skeleton shimmer'></div></h1>
                <p className='para-skeleton shimmer'></p>
                <p className='para-skeleton shimmer'></p>
                <p className='para-skeleton shimmer'></p>
            </div>
            :<div className="markdown-container">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            }
        </div>
    )
}

export default DocsPage