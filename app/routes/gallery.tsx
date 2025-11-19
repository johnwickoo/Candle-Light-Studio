import React, { use } from 'react'
import { createApi } from "unsplash-js";
import { useEffect, useState } from "react";

const unsplash = createApi({
  accessKey: import.meta.env.VITE_API_KEY,
});

const gallery = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  useEffect(() => {
    unsplash.photos
      .list({ page: 1, perPage: 10 })
      .then((result) => {
        if (result.errors) {
          console.log("error occurred: ", result.errors[0]);
        } else {
          console.log("photos received: ", result.response.results);
          setPhotos(result.response.results);
        }
      });
  }, []);

  return (
    <div>
      <h1>Gallery</h1>
      <div className='columns-3 gap-4'>
        {photos.map((photo) => (
          <img className='mb-4 w-full h-auto' key={photo.id} src={photo.urls.small} alt={photo.alt_description} />
        ))}
      </div>
    </div>
  );
}

export default gallery