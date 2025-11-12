import { createContext, useState, useContext } from "react";

const FetchContext = createContext();

export const FetchProvider = ({ children }) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  return (
    <FetchContext.Provider value={{ shouldFetch, setShouldFetch }}>
      {children}
    </FetchContext.Provider>
  );
};

export const useFetch = () => useContext(FetchContext);
