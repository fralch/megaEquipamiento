import { useContext } from 'react';
import { CompareContext } from '../storage/CompareContext';

export const useCompare = () => {
  const context = useContext(CompareContext);
  
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }

  const { compareList, dispatch } = context;

  const addToCompare = (product) => {
    dispatch({ type: 'ADD_TO_COMPARE', product });
  };

  const removeFromCompare = (productId) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', id: productId });
  };

  const clearCompare = () => {
    dispatch({ type: 'CLEAR_COMPARE' });
  };

  const isInCompare = (productId) => {
    return compareList.some(item => item.id === productId);
  };

  const compareCount = compareList.length;
  const canAddMore = compareCount < 4;
  const hasProducts = compareCount > 0;

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    compareCount,
    canAddMore,
    hasProducts
  };
};