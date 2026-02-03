import { createContext, useContext } from 'react';

// Create a context with a default value.
// Components will get this if they are somehow used outside the provider.
export const DimensionsContext = createContext({ width: 0, height: 0 });

// Create a custom hook that our components can use to easily get the dimensions.
export const useAppDimensions = () => {
  return useContext(DimensionsContext);
};
