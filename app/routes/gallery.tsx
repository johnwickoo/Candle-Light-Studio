import React, { useEffect, useState } from "react";
import { data } from "react-router";
import { useGallery } from "~/components/GalleryContext";

type errorType = string | null;

const Gallery = () => {
  const { photos, setPhotos, hasLoaded, setHasLoaded } = useGallery();
  const [isLoading, setIsLoading] = useState(!hasLoaded);
  const [error, setError] = useState<errorType>(null);
  
  // Helper functions for error handling
  function getErrorMessage(e: unknown): string {
    if (isErrorWithMessage(e)) return e.message;
    return 'An unknown error occurred.';
  }

  function isErrorWithMessage(e: unknown): e is { message: string } {
    return (
      typeof e === 'object' &&
      e !== null &&
      'message' in e &&
      typeof (e as any).message === 'string'
    );
  }

  useEffect(() => {
  if (hasLoaded) return;
  const fetchPhotosSecurely = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/gallery.ts');
      console.log("Gallery Response:", res);
      
      // Check if response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("Received HTML instead of JSON:", text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. API endpoint may not be configured correctly.');
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Gallery Data:", data);
      
      if (data.error) {
        setError(data.message);
      } else {
        setPhotos(data.photos || []);
        setHasLoaded(true);
      }
    } catch (e) {
      console.error("Execution Error:", e);
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  fetchPhotosSecurely();
}, [hasLoaded, setPhotos, setHasLoaded]);

  if (isLoading) return <div className="p-10">Loading gallery...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold p-4">Gallery</h1>
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3 p-4">
        {photos.map((photo) => (
          <img
            className="mb-4 w-full h-auto rounded shadow-sm"
            key={photo.id}
            src={photo.urls.small}
            alt={photo.alt_description}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;