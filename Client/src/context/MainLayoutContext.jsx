import { createContext, useContext, useState } from "react";

// Create context
const MainLayoutContext = createContext();

// Provider component
export function MainLayoutProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subInfo, setSubInfo] = useState({});
  const [progressData, setProgressData] = useState([]);
  
  return (
    <MainLayoutContext.Provider 
    value={{
      isSidebarOpen, setIsSidebarOpen,
      subInfo, setSubInfo,
      progressData, setProgressData 
    }}>
      {children}
    </MainLayoutContext.Provider>
  );
}

export default MainLayoutContext;
