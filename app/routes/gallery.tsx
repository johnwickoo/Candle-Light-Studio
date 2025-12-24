import React, { use } from 'react'
import { useEffect, useState } from "react";

type errorType = string | null;
const gallery = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<errorType>(null);

  function getErrorMessage(e: unknown): string {
    if (isErrorWithMessage(e)) {
        return e.message;
    }
    // Fallback message if it's not a standard error object
    return 'An unknown error occurred.'; 
}

  function isErrorWithMessage(e: unknown): e is { message: string } {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
} 
  useEffect(() => {
        const fetchPhotosSecurely = async () => {
            try {
                // 1. Call your Appwrite function endpoint
                const response = await fetch('https://6932a4ba000599fc5758.fra.appwrite.run', {
                    method: 'GET',
                }); 
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // 2. Handle the JSON response from your Appwrite function
                if (data.error) {
                    setError(data.message);
                } else {
                    setPhotos(data.photos);
                }

            } catch (e) {
                setError(getErrorMessage(e));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhotosSecurely();
    }, []);

  return (
    <div>
      <h1>Gallery</h1>
      <div className='columns-1 gap-4 md:columns-2 lg:columns-3 p-4'>
        {photos.map((photo) => (
          <img className='mb-4 w-full h-auto' key={photo.id} src={photo.urls.small} alt={photo.alt_description} />
        ))}
      </div>
    </div>
  );
}

export default gallery