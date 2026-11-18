// Client-side saved properties persistence helper (keyed per user)

export const getFavorites = (userId = 'guest') => {
  try {
    const data = localStorage.getItem(`primehaven_favs_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const isFavorite = (propertyId, userId = 'guest') => {
  const list = getFavorites(userId);
  return list.includes(Number(propertyId));
};

export const toggleFavorite = (propertyId, userId = 'guest') => {
  const pId = Number(propertyId);
  const list = getFavorites(userId);
  let updated;
  if (list.includes(pId)) {
    updated = list.filter((id) => id !== pId);
  } else {
    updated = [...list, pId];
  }
  try {
    localStorage.setItem(`primehaven_favs_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('primehaven:favorites_updated', { detail: { userId, favorites: updated } }));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
  return updated.includes(pId);
};
