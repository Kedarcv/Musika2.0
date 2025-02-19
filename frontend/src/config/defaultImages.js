const imageParams = 'w=400&h=200&fit=crop&auto=format&q=80';

export const defaultImages = {
  Italian: `https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?${imageParams}`,
  Japanese: `https://images.unsplash.com/photo-1579871494447-9811cf80d66c?${imageParams}`,
  American: `https://images.unsplash.com/photo-1551782450-a2132b4ba21d?${imageParams}`,
  Indian: `https://images.unsplash.com/photo-1585937421612-70a008356fbe?${imageParams}`,
  Chinese: `https://images.unsplash.com/photo-1563245372-f21724e3856d?${imageParams}`,
  Thai: `https://images.unsplash.com/photo-1559314809-0d155014e29e?${imageParams}`,
  Mexican: `https://images.unsplash.com/photo-1565299585323-38d6b0865b47?${imageParams}`,
  default: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?${imageParams}`,
};

export const getDefaultImage = (cuisines) => {
  if (!cuisines || !Array.isArray(cuisines) || cuisines.length === 0) {
    return defaultImages.default;
  }
  const primaryCuisine = cuisines[0];
  return defaultImages[primaryCuisine] || defaultImages.default;
};

// Helper function to get a blurred placeholder version of the image
export const getPlaceholderImage = (url) => {
  if (!url) return defaultImages.default;
  const placeholderParams = 'w=50&blur=50';
  return url.includes('?') 
    ? url.replace(/\?.*/, `?${placeholderParams}`)
    : `${url}?${placeholderParams}`;
};
