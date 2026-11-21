import { createContext, useContext } from "react";

export const SelectionContext = createContext();

export const useSelection = () => useContext(SelectionContext);
