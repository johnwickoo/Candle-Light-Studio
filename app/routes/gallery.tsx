import { useEffect } from "react";
import type { Route } from "./+types/gallery";
import { createApi } from 'unsplash-js';
import { useGallery } from "~/components/GalleryContext";

const unsplash = createApi({
  accessKey: "W8so0FCFsKhQkMWyhpmDm5V6CzBFmvebUh7EZas9KTg",
});

// This runs on the SERVER - your API key is safe
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const response = await unsplash.photos.list({
      page: 1,
      perPage: 12,
    });

    if (response.type === 'error') {
      return { 
        error: true,
        message: response.errors.join(', '),
        photos: []
      };
    }

    return { 
      error: false,
      photos: response.response.results,
      message: null
    };
  } catch (err: any) {
    console.error('Unsplash Error:', err);
    return { 
      error: true, 
      message: err.message || 'Gallery fetch failed',
      photos: [] 
    };
  }
}

export default function Gallery({ loaderData }: Route.ComponentProps) {
  const { photos, setPhotos, hasLoaded, setHasLoaded } = useGallery();
  
  // Update context with loaded data once
  useEffect(() => {
    if (!hasLoaded && loaderData.photos.length > 0) {
      setPhotos(loaderData.photos);
      setHasLoaded(true);
    }
  }, [loaderData.photos, hasLoaded, setPhotos, setHasLoaded]);

  // Handle error state
  if (loaderData.error) {
    return (
      <div className="p-4 text-red-500">
        Error: {loaderData.message}
      </div>
    );
  }

  // Show photos from loaderData (server-rendered) or context (cached)
  const displayPhotos = hasLoaded ? photos : loaderData.photos;

  return (
    <div>
      <h1 className="text-2xl font-bold p-4">Gallery</h1>
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3 p-4">
        {displayPhotos.map((photo: any) => (
          <img
            className="mb-4 w-full h-auto rounded shadow-sm"
            key={photo.id}
            src={photo.urls.small}
            alt={photo.alt_description || 'Gallery photo'}
          />
        ))}
      </div>
    </div>
  );
}