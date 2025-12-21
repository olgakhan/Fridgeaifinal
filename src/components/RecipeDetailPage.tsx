import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Clock, Users, ChefHat, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Recipe {
  id: number;
  name: string;
  description: string;
  gradient?: string;
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

interface RecipeDetailPageProps {
  recipe: Recipe;
  onNavigate: (page: string, data?: any, replace?: boolean) => void;
}

export function RecipeDetailPage({ recipe, onNavigate }: RecipeDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [recipe.name]);

  const checkIfLiked = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes`, {
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        const liked = data.recipes.some((r: Recipe) => r.name === recipe.name);
        setIsLiked(liked);
      }
    } catch (err) {
      console.error("Failed to check if recipe is liked:", err);
    }
  };

  const toggleLike = async () => {
    try {
      if (isLiked) {
        const recipeName = recipe.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes/${recipeName}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${publicAnonKey}` },
        });
        setIsLiked(false);
        toast.success("Recipe removed from favorites!");
      } else {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(recipe),
        });
        setIsLiked(true);
        toast.success("Recipe saved to your favorites!");
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = () => {
    toast.success("Recipe link copied to clipboard!");
  };

  // Use AI-generated instructions if available, otherwise use default ones
  const defaultInstructions = [
    "Prepare all ingredients by washing, chopping, and measuring according to the recipe requirements.",
    "Heat your cooking vessel to the appropriate temperature. For this recipe, medium-high heat works best.",
    "Begin by cooking your protein or base ingredients first, ensuring they're properly seasoned.",
    "Add vegetables or additional ingredients in the order specified, cooking each until tender.",
    "Combine all components and adjust seasoning to taste. Cook for the remaining time specified.",
    "Plate your dish attractively and serve immediately while hot for the best flavor and texture.",
  ];

  const instructions = recipe.instructions && recipe.instructions.length > 0 
    ? recipe.instructions 
    : defaultInstructions;

  const nutritionInfo = [
    { label: "Calories", value: `${recipe.calories} kcal` },
    { label: "Protein", value: `${recipe.protein}g` },
    { label: "Carbs", value: "32g" },
    { label: "Fat", value: "14g" },
    { label: "Fiber", value: "8g" },
    { label: "Sugar", value: "6g" },
  ];

  const tips = [
    "Prep all ingredients before you start cooking for a smoother experience",
    "Don't overcrowd the pan - cook in batches if needed",
    "Taste and adjust seasoning throughout the cooking process",
    "Let proteins rest for a few minutes before serving",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('recipes')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>

          {/* Hero Gradient */}
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] flex items-center justify-center"
            style={{ background: recipe.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <h1 className="relative text-white text-5xl text-center px-8 drop-shadow-lg z-10">
              {recipe.name}
            </h1>
            <div className="absolute top-4 right-4 bg-white/90 text-gray-800 px-4 py-2 rounded-full font-semibold">
              {recipe.matchPercentage}% Match
            </div>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h1>{recipe.name}</h1>
                <p className="text-gray-600">
                  {recipe.description}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleLike}
                className="flex-shrink-0"
              >
                {isLiked ? (
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                ) : (
                  <Heart className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
                <Clock className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-gray-500">Prep</div>
                  <div>{recipe.prepTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
                <Clock className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-gray-500">Cook</div>
                  <div>{recipe.cookTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
                <Users className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-gray-500">Servings</div>
                  <div>{recipe.servings}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
                <ChefHat className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-gray-500">Difficulty</div>
                  <div>{recipe.difficulty}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition & Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-emerald-600 mb-3">From Your Fridge</h3>
                    <div className="space-y-2">
                      {recipe.usedIngredients.map((ingredient, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg"
                        >
                          <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                          <span>{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3">Additional Ingredients Needed</h3>
                    <div className="space-y-2">
                      {recipe.additionalIngredients.map((ingredient, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <span>{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-700">{instruction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nutrition Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {nutritionInfo.map((info) => (
                        <div key={info.label} className="p-4 bg-gray-50 rounded-lg text-center">
                          <div className="text-gray-500">{info.label}</div>
                          <div className="text-emerald-600">{info.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chef's Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tips.map((tip, index) => (
                        <li key={index} className="flex gap-3">
                          <Badge variant="secondary" className="flex-shrink-0">
                            Tip {index + 1}
                          </Badge>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onNavigate('recipes', undefined, false)}
            >
              Try Another Recipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}