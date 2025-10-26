
export default function Spinner({size='18px',dots='3px',speed='1.2s',color='#FFF'}) {
const loader = {
  width: size,
  height: size,
  border: `${dots} dotted ${color}`,
  borderRadius: '50%',
  display: "inline-Block",
  position: "relative",
  boxSizing: 'border-box',
  animation: `rotation ${speed} linear infinite`
}

  return (
    <>
    <span className="spinner" style={loader}/>  
     <style>
        {`
          @keyframes rotation {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
          } 
        `}
      </style> 
    </>
  );
}