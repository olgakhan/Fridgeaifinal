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

export function getRecipeImage(index: number): string {
  return recipeFallbackImages[index % recipeFallbackImages.length];
}

/**
 * Fetch a relevant image from Unsplash based on the recipe name
 * Falls back to index-based image if Unsplash fails
 */
export async function getRecipeImageForDish(recipeName: string, fallbackIndex: number): Promise<string> {
  try {
    // Clean up recipe name for search
    const searchQuery = recipeName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .toLowerCase()
      .trim();
    
    console.log(`🖼️ Fetching image for recipe: "${recipeName}" (query: "${searchQuery}")`);
    
    // Use Unsplash API to search for relevant food images
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery + ' food dish')}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': 'Client-ID 5PcPB18kJDB2BrnAE_bLvb_BZcb8a2seL7F6anger_k'
        }
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Unsplash API returned ${response.status}, using fallback`);
      return getRecipeImage(fallbackIndex);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log(`✅ Found Unsplash image for "${recipeName}"`);
      return imageUrl;
    } else {
      console.warn(`⚠️ No Unsplash results for "${recipeName}", using fallback`);
      return getRecipeImage(fallbackIndex);
    }
  } catch (error) {
    console.error(`❌ Error fetching Unsplash image for "${recipeName}":`, error);
    return getRecipeImage(fallbackIndex);
  }
}