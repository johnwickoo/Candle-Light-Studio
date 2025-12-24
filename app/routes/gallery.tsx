import React, { useEffect, useState } from "react";
import { Client, Functions, ExecutionMethod } from "appwrite";
import { useGallery } from "~/components/GalleryContext";

// 1. Initialize the SDK outside the component or in a separate config file
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') 
    .setProject('68d063fc000f50d84cd2');

const functions = new Functions(client);

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
        // 2. Use the SDK instead of fetch()
        // This executes the function and waits for the response
        const execution = await functions.createExecution(
          '6932a4b8003ac1b7e5cc', // Your Function ID
          '',                     // Body (empty for a GET-style list)
          false,                  // async = false (Wait for the result)
          '/',                    // path
          ExecutionMethod.GET     // method
        );

        // 3. Appwrite SDK returns a string in responseBody; we must parse it
        if (execution.responseStatusCode >= 400) {
            throw new Error(`Function returned status ${execution.responseStatusCode}`);
        }

        const data = JSON.parse(execution.responseBody);

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