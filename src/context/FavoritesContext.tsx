"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

const FAVORITES_STORAGE_KEY = "ponelapava_favorites";

type FavoritesAction =
  { type: "TOGGLE"; productId: string } | { type: "HYDRATE"; ids: string[] };

function favoritesReducer(
  state: Set<string>,
  action: FavoritesAction,
): Set<string> {
  switch (action.type) {
    case "TOGGLE": {
      const next = new Set(state);
      if (next.has(action.productId)) next.delete(action.productId);
      else next.add(action.productId);
      return next;
    }
    case "HYDRATE":
      return new Set(action.ids);
    default:
      return state;
  }
}

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, dispatch] = useReducer(
    favoritesReducer,
    new Set<string>(),
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) dispatch({ type: "HYDRATE", ids: JSON.parse(stored) });
    } catch {
      // ignore parse errors
    }
  }, []);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    try {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(Array.from(favoriteIds)),
      );
    } catch {
      // ignore storage errors
    }
  }, [favoriteIds]);

  const toggleFavorite = useCallback((productId: string) => {
    dispatch({ type: "TOGGLE", productId });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
