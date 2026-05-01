import { createContext, useContext } from 'react';
import { RefObject } from 'react';
import { GestureType } from 'react-native-gesture-handler';

export type GestureRef = RefObject<GestureType | undefined>;

export const GestureAncestorContext = createContext<GestureRef[]>([]);

export const useGestureAncestorRefs = () => useContext(GestureAncestorContext);
