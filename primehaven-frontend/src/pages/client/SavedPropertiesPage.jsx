import React, { useState, useEffect } from 'react';
import { Heart, Compass } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PropertyGrid from '../../components/property/PropertyGrid';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import propertyApi from '../../services/propertyApi';
import { getFavorites } from '../../utils/favoritesStorage';
import './ClientPages.css';

export const SavedPropertiesPage = () => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const favIds = getFavorites(user?.id);
      if (favIds.length === 0) {
        setSavedProperties([]);
        setLoading(false);
        return;
      }

      const all = await propertyApi.getAll();
      if (Array.isArray(all)) {
        const filtered = all.filter((p) => favIds.includes(p.id));
        setSavedProperties(filtered);
      }
    } catch (err) {
      console.error('Failed to load saved properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();

    const handleFavUpdated = () => {
      fetchSaved();
    };
    window.addEventListener('primehaven:favorites_updated', handleFavUpdated);
    return () => {
      window.removeEventListener('primehaven:favorites_updated', handleFavUpdated);
    };
  }, [user?.id]);

  return (
    <DashboardLayout title="Saved Properties">
      <div className="client-page-header">
        <div>
          <h2 className="font-serif page-subtitle">Personal Wishlist & Collections</h2>
          <p className="page-desc">
            Properties you've bookmarked for future reference and private viewing.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {loading ? (
          <PropertyGrid loading={true} />
        ) : savedProperties.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved properties yet"
            description="Explore residences and tap the heart icon on any listing to save it to your collection."
            actionLabel="Discover Properties"
            onAction={() => (window.location.href = '/properties')}
          />
        ) : (
          <PropertyGrid properties={savedProperties} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedPropertiesPage;
