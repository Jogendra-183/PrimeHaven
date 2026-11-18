// Curated luxury architectural and residential photography collections

export const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', // Modern Apartment Tower
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', // Skyline Crest Penthouse
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', // The Ivory Garden Villa
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // Oakwood Urban Flats
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', // The Pearl Waterfront Residence
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80', // Cedar Heights Residence
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', // The Solstice Private Estate
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', // Urban Nest Studio
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', // Sovereign Sky Villa
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', // Emerald Crest Flat
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', // Casa Serene Villa
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', // The Bellevue Residence
];

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85';

export const getPropertyImage = (propertyId = 1, propertyType = '', propertyObj = null) => {
  if (propertyObj?.image) {
    return propertyObj.image;
  }
  const numId = Number(propertyId) || 1;
  const index = Math.abs(numId - 1) % PROPERTY_IMAGES.length;
  return PROPERTY_IMAGES[index];
};

export const getPropertyGallery = (propertyId = 1, propertyObj = null) => {
  if (propertyObj?.gallery && Array.isArray(propertyObj.gallery) && propertyObj.gallery.length > 0) {
    return propertyObj.gallery;
  }
  const numId = Number(propertyId) || 1;
  const startIdx = Math.abs(numId - 1) % PROPERTY_IMAGES.length;
  return [
    PROPERTY_IMAGES[startIdx],
    PROPERTY_IMAGES[(startIdx + 1) % PROPERTY_IMAGES.length],
    PROPERTY_IMAGES[(startIdx + 2) % PROPERTY_IMAGES.length],
    PROPERTY_IMAGES[(startIdx + 3) % PROPERTY_IMAGES.length],
  ];
};

export default {
  PROPERTY_IMAGES,
  FALLBACK_IMAGE,
  HERO_IMAGE,
  getPropertyImage,
  getPropertyGallery,
};
