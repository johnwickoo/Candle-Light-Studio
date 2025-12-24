import React, { createContext, useContext, useState, type ReactNode } from 'react';

type GalleryContextType = {
  photos: any[];
  setPhotos: (photos: any[]) => void;
  hasLoaded: boolean;
  setHasLoaded: (val: boolean) => void;
};

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <GalleryContext.Provider value={{ photos, setPhotos, hasLoaded, setHasLoaded }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error("useGallery must be used within a GalleryProvider");
  return context;
};