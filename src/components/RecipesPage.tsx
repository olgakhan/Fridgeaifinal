import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Users, Star, Zap, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Recipe {
  id: number;
  name: string;
  description: string;
  gradient: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  matchPercentage: number;
  usedIngredients: string[];
  additionalIngredients: string[];
  calories: number;
  protein: number;
  instructions?: string[];
}

interface RecipesPageProps {
  ingredients: string[];
  mainGoal: string;
  dietaryRestrictions: string[];
  mealType: string;
  onNavigate: (page: string, data?: any) => void;
  initialRecipes?: Recipe[];
  initialSuggestions?: string | null;
  onRecipesGenerated?: (recipes: Recipe[], suggestions: string) => void;
}

export function RecipesPage({ ingredients, mainGoal, dietaryRestrictions, mealType, onNavigate, initialRecipes, initialSuggestions, onRecipesGenerated }: RecipesPageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(initialSuggestions || null);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [currentRecipeCount, setCurrentRecipeCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Generating recipes...");
  const [isGeneratingBatch2, setIsGeneratingBatch2] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const cookingFacts = [
    "🔪 Did you know? A sharp knife is safer than a dull one - it requires less force and gives you better control!",
    "🧂 Salt your pasta water! It should taste like the sea for perfectly seasoned pasta.",
    "🥘 Let meat rest after cooking - this allows juices to redistribute for a more tender, flavorful result!",
    "🌡️ Room temperature ingredients mix more easily and create better textures in baking.",
    "🧄 Garlic flavor intensifies the longer you cook it - add it late for mild flavor, early for bold!",
    "🥩 Searing doesn't 'seal in' juices, but it does create delicious flavor through the Maillard reaction!",
    "🍅 Store tomatoes at room temperature for better flavor - cold temps kill their taste!",
    "🧈 Butter burns at high heat - use ghee or clarified butter for high-temperature cooking!",
    "🥦 Don't overcrowd your pan! It lowers temperature and creates steam instead of a nice sear.",
    "🍳 Add a pinch of salt to whipped cream or meringue - it stabilizes the foam and enhances sweetness!",
  ];

  // Initialize with a random cooking fact
  const [currentFactIndex, setCurrentFactIndex] = useState(() => Math.floor(Math.random() * cookingFacts.length));

  useEffect(() => {
    // Only generate recipes if we don't have initial recipes
    if (!initialRecipes || initialRecipes.length === 0) {
      generateRecipes();
    } else {
      // We have initial recipes, just show them
      setLoading(false);
    }
    loadLikedRecipes();
  }, [ingredients, mainGoal, dietaryRestrictions, mealType]);

  // Rotate cooking facts while loading
  useEffect(() => {
    if (loading && recipes.length === 0) {
      const factInterval = setInterval(() => {
        setCurrentFactIndex((prev) => {
          // Pick a random index that's different from the current one
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * cookingFacts.length);
          } while (newIndex === prev && cookingFacts.length > 1);
          return newIndex;
        });
      }, 7000); // 7 seconds

      // Simulate progress bar animation
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return 95; // Cap at 95% until real data arrives
          return prev + Math.random() * 8;
        });
      }, 300);

      return () => {
        clearInterval(factInterval);
        clearInterval(progressInterval);
      };
    }
  }, [loading, recipes.length]);

  const loadLikedRecipes = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes`, {
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        const likedNames = new Set(data.recipes.map((r: Recipe) => r.name));
        setLikedRecipes(likedNames);
      }
    } catch (err) {
      console.error("Failed to load liked recipes:", err);
    }
  };

  const toggleLike = async (recipe: Recipe) => {
    const isLiked = likedRecipes.has(recipe.name);
    
    try {
      if (isLiked) {
        const recipeName = recipe.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes/${recipeName}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${publicAnonKey}` },
        });
        setLikedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipe.name);
          return newSet;
        });
      } else {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(recipe),
        });
        setLikedRecipes(prev => new Set([...prev, recipe.name]));
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const generateRecipes = async () => {
    setRecipes([]);
    setLoading(true);
    setError(null);
    setSuggestions(null);
    setCurrentRecipeCount(0);
    setIsGeneratingBatch2(false);
    setLoadingProgress(0);

    try {
      console.log("🔍 Starting recipe generation");
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/generate-recipes`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ ingredients, mainGoal, dietaryRestrictions, mealType }),
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => "Failed to connect");
        throw new Error(errorData || "Failed to connect to recipe generation service");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      let buffer = "";
      const receivedRecipes: Recipe[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("✅ Streaming complete");
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete messages (SSE format: "data: {json}\n\n")
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep incomplete message in buffer
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          
          try {
            const jsonStr = line.substring(6); // Remove "data: " prefix
            const message = JSON.parse(jsonStr);
            
            if (message.error) {
              throw new Error(message.error);
            }
            
            if (message.type === "suggestions") {
              setSuggestions(message.data);
              console.log("📝 Received suggestions");
            } else if (message.type === "recipe") {
              receivedRecipes.push(message.data);
              setRecipes([...receivedRecipes]);
              setCurrentRecipeCount(receivedRecipes.length);
              setLoadingProgress((receivedRecipes.length / 6) * 100);
              
              // Mark when we start showing the second batch
              if (receivedRecipes.length === 4) {
                setIsGeneratingBatch2(true);
              }
              
              console.log(`✅ Displaying recipe ${receivedRecipes.length}: ${message.data.name}`);
            } else if (message.type === "complete") {
              console.log("✅ All recipes received");
            }
          } catch (parseError) {
            console.error("Failed to parse message:", line, parseError);
          }
        }
      }

      setLoading(false);
      setIsGeneratingBatch2(false);

      // Call the callback if provided
      if (onRecipesGenerated) {
        onRecipesGenerated(receivedRecipes, suggestions || "");
      }

    } catch (err) {
      console.error("❌ Error generating recipes:", err);
      setError(err instanceof Error ? err.message : "Failed to generate recipes");
      setLoading(false);
      setIsGeneratingBatch2(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {suggestions && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-4 shadow-md"
          >
            <div className="flex items-start gap-3">
              <ShoppingCart className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900 mb-1">💡 Shopping Suggestions</h3>
                <p className="text-emerald-800 text-sm">{suggestions}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Progress Bar */}
        {loading && recipes.length > 0 && recipes.length < 6 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-5 w-5 text-emerald-600" />
                  </motion.div>
                  <span className="text-emerald-800 font-semibold">
                    Generating your personalized recipes...
                  </span>
                </div>
                <span className="text-emerald-700 font-bold text-lg">
                  {recipes.length}/6 Ready
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(recipes.length / 6) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-emerald-600 text-sm mt-2 text-center">
                {recipes.length < 3 ? "Creating first batch of delicious recipes..." : "Almost there! Working on the final recipes..."}
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error generating recipes:</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={generateRecipes}
              className="mt-3 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Grid for recipes - 3 per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Card className="relative hover:shadow-xl transition-shadow overflow-hidden h-full">
                  {/* Gradient Background */}
                  <div 
                    className="relative h-48 flex items-center justify-center"
                    style={{ background: recipe.gradient }}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <h3 className="relative text-white text-2xl text-center px-4 drop-shadow-lg z-10">
                      {recipe.name}
                    </h3>
                    <div className="absolute top-2 right-2 bg-white/90 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {recipe.matchPercentage}%
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(recipe);
                      }}
                      className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full p-2 h-auto z-20"
                    >
                      {likedRecipes.has(recipe.name) ? (
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="h-5 w-5 text-gray-600" />
                      )}
                    </Button>
                  </div>
                  
                  <div onClick={() => onNavigate("recipe-detail", { recipe })} className="cursor-pointer">
                    <CardHeader>
                      <CardDescription>{recipe.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 text-gray-600 mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {recipe.cookTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> {recipe.servings}
                        </div>
                        <Badge className={getDifficultyColor(recipe.difficulty)}>{recipe.difficulty}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.usedIngredients?.slice(0, 4).map((ing) => (
                          <Badge key={ing} className="text-xs bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-300">{ing}</Badge>
                        ))}
                        {recipe.usedIngredients?.length > 4 && (
                          <Badge className="text-xs bg-gray-100 text-gray-600">+{recipe.usedIngredients.length - 4}</Badge>
                        )}
                      </div>
                      <div className="flex justify-between text-gray-700 text-sm mb-3">
                        <span>{recipe.calories} cal</span>
                        <span>{recipe.protein}g protein</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                        <Zap className="mr-2 h-4 w-4" /> View Recipe
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Preparing next recipe indicator */}
            {isGeneratingBatch2 && currentRecipeCount < 6 && (
              <motion.div
                key="preparing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center"
              >
                <Card className="h-full w-full border-2 border-dashed border-emerald-300 bg-emerald-50/50">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-12 w-12 text-emerald-600" />
                    </motion.div>
                    <p className="mt-4 text-emerald-700 font-semibold">Preparing recipe {currentRecipeCount + 1}...</p>
                    <p className="text-emerald-600 text-sm mt-1">✨ Cooking up something delicious</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Initial loading state */}
        {loading && recipes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-2 border-emerald-300 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                <div className="flex items-center justify-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Loader2 className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-white text-2xl">Generating Your Personalized Recipes</h2>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                {/* Animated Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Analyzing your ingredients...</span>
                    <span className="text-emerald-700 font-semibold">{Math.round(loadingProgress)}%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-4 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Cooking Steps Animation */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: "🔍", label: "Analyzing", active: loadingProgress > 0 },
                    { icon: "🤖", label: "AI Processing", active: loadingProgress > 30 },
                    { icon: "✨", label: "Finalizing", active: loadingProgress > 60 }
                  ].map((step, index) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0.3, scale: 0.9 }}
                      animate={{ 
                        opacity: step.active ? 1 : 0.3,
                        scale: step.active ? 1 : 0.9
                      }}
                      transition={{ duration: 0.5 }}
                      className={`text-center p-4 rounded-lg border-2 ${
                        step.active 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{step.icon}</div>
                      <div className={`text-sm font-semibold ${
                        step.active ? 'text-emerald-700' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Rotating Cooking Facts */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 min-h-[100px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFactIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="w-full"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-amber-200 rounded-full p-2">
                          <Star className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-amber-900 mb-1">💡 Cooking Tip</h3>
                          <p className="text-amber-800 text-sm leading-relaxed">
                            {cookingFacts[currentFactIndex]}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bouncing Ingredient Icons */}
                <div className="flex justify-center gap-3 py-4">
                  {['🥗', '🍳', '🥘', '🍕', '🥙', '🍜'].map((emoji, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        y: [0, -15, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.15,
                        ease: "easeInOut"
                      }}
                      className="text-3xl"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-emerald-600 text-sm italic">
                  Our AI chef is crafting recipes tailored to your ingredients and preferences...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Progress indicator when some recipes are loaded */}
        {loading && recipes.length > 0 && recipes.length < 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-emerald-100 border-2 border-emerald-300 rounded-full px-6 py-3 shadow-lg">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-5 w-5 text-emerald-600" />
              </motion.div>
              <p className="text-emerald-800 font-semibold">Ready {recipes.length}/6</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}