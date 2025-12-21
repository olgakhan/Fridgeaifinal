// Fallback images for different recipe categories
export const recipeFallbackImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop", // General food
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop", // Cooking
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop", // Pizza/Italian
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop", // Salad
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop", // Pancakes/Breakfast
  "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&auto=format&fit=crop", // Soup
  "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format&fit=crop", // Bowl
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&auto=format&fit=crop", // Healthy food
];

export function getRecipeImage(recipeName: string, index: number): string {
  // Return a consistent image for the same recipe based on index
  return recipeFallbackImages[index % recipeFallbackImages.length];
}
