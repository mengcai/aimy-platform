export const getAssetImage = (assetId: string) => {
  // In a real app, these would be actual asset images
  const imageMap: { [key: string]: string } = {
    'solar-farm-alpha': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    'real-estate-fund-beta': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    'infrastructure-bonds-gamma': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    'wind-energy-delta': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
    'tech-startup-epsilon': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    'commodity-fund-zeta': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    'healthcare-reit-eta': 'https://images.unsplash.com/photo-1576091160399-112c8b76a383?w=400&h=300&fit=crop',
    'data-center-theta': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    'agricultural-land-iota': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    'mining-operation-kappa': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop',
    'intellipro-group': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
    'energy-storage-lambda': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
  };

  return imageMap[assetId] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop';
};

export const getAssetTypeIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    'renewable energy': '🌞',
    'real estate': '🏢',
    'infrastructure': '🏗️',
    'technology': '💻',
    'commodity': '📦',
    'healthcare': '🏥',
    'agriculture': '🌾',
    'mining': '⛏️',
    'energy': '⚡'
  };

  return iconMap[type.toLowerCase()] || '📊';
};
