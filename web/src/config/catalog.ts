// Map MongoDB/API fields to the public catalogue's display fields.
export function normalizeCatalogItem(path: string, item: Record<string, unknown>): Record<string, unknown> {
  const result = { ...item, id: item.id || item._id };
  if (path === '/services/categories') return { ...result, slug: item.slug || item.id || item._id };
  if (path === '/services') {
    const category = typeof item.categoryId === 'object' && item.categoryId !== null
      ? item.categoryId as Record<string, unknown> : undefined;
    return {
      ...result,
      categoryId: category ? category.id || category._id : item.categoryId,
      category: category ? { ...category, id: category.id || category._id } : item.category,
      duration: typeof item.duration === 'number' ? `${item.duration} minutes` : item.duration,
      imageUrl: item.imageUrl || item.image,
    };
  }
  if (path === '/spare-parts') return {
    ...result,
    category: item.category || item.categoryTag || '',
    imageUrl: item.imageUrl || (Array.isArray(item.images) ? item.images[0] : undefined),
    inStock: typeof item.stock === 'number' ? item.stock > 0 : item.inStock,
  };
  if (path === '/used-cars') {
    const location = typeof item.location === 'object' && item.location !== null
      ? item.location as Record<string, unknown> : undefined;
    const fuel = String(item.fuelType || '');
    return {
      ...result,
      location: location ? [location.city, location.state].filter(Boolean).join(', ') : item.location,
      city: location?.city || item.city,
      fuelType: fuel === 'CNG' ? fuel : fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase(),
      imageUrl: item.imageUrl || (Array.isArray(item.images) ? item.images[0] : undefined),
    };
  }
  return result;
}
