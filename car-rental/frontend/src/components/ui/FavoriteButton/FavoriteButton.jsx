import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { addFavorite, removeFavorite, getFavorites } from '@/services/api';
import { toast } from 'react-toastify';
import './FavoriteButton.scss';

const FavoriteButton = ({ carId, supplierId, initialIsFavorite = false, initialFavoriteId = null, onFavoriteChange }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [favoriteId, setFavoriteId] = useState(initialFavoriteId);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [checked, setChecked] = useState(false);

    // Always check favorite state on mount or carId change
    useEffect(() => {
        let mounted = true;
        const checkFavorite = async () => {
            try {
                const favorites = await getFavorites();
                const found = favorites.find(f => f.carId === carId);
                if (mounted) {
                    setIsFavorite(!!found);
                    setFavoriteId(found ? found.favoriteId || found.id : null);
                    setChecked(true);
                }
            } catch (e) {
                setChecked(true);
            }
        };
        checkFavorite();
        return () => { mounted = false; };
    }, [carId]);

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        if (isLoading) return;

        try {
            setIsLoading(true);
            setIsAnimating(true);
            if (isFavorite) {
                // Remove from favorites using favoriteId
                if (favoriteId) {
                    await removeFavorite(favoriteId);
                    setIsFavorite(false);
                    setFavoriteId(null);
                    toast.success('Đã xóa khỏi danh sách yêu thích');
                    if (onFavoriteChange) {
                        onFavoriteChange(false);
                    }
                } else {
                    toast.error('Vui lòng cung cấp ID yêu thích');
                }
            } else {
                // Add to favorites
                const result = await addFavorite(carId, supplierId);
                setIsFavorite(true);
                setFavoriteId(result?.favoriteId || result?.id);
                toast.success('Đã thêm vào danh sách yêu thích');
                if (onFavoriteChange) {
                    onFavoriteChange(true);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
            toast.error(errorMessage);
            console.error('[FavoriteButton] Favorite error:', error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={isLoading || !checked}
            className={`favorite-button${isAnimating ? ' animating' : ''}`}
            title={isFavorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
            {isLoading ? (
                <div className="loading-spinner" />
            ) : (
                <FaHeart className="heart-icon" color={isFavorite ? '#e53e3e' : '#222'} />
            )}
        </button>
    );
};

export default FavoriteButton; 