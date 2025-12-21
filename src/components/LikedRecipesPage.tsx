import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Users, Star, Zap, Heart, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
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
  gradient?: string;
}

interface LikedRecipesPageProps {
  onNavigate: (page: string, data?: any, replace?: boolean) => void;
  previousPage?: string;
}

export function LikedRecipesPage({ onNavigate, previousPage }: LikedRecipesPageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedRecipes();
    console.log("LikedRecipesPage - previousPage:", previousPage);
  }, []);

  const loadLikedRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes`, {
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error("Failed to load liked recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeLike = async (recipeName: string) => {
    try {
      const key = recipeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/liked-recipes/${key}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${publicAnonKey}` },
      });
      setRecipes(prev => prev.filter(r => r.name !== recipeName));
    } catch (err) {
      console.error("Failed to remove liked recipe:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100">
        <motion.div className="text-center" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          <p className="mt-4 text-gray-700">Loading your favorites... ❤️</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              const targetPage = previousPage && previousPage !== "liked-recipes" ? previousPage : "home";
              console.log("Back button clicked - navigating to:", targetPage);
              onNavigate(targetPage, undefined, false);
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl mb-2">❤️ Your Liked Recipes</h1>
            <p className="text-gray-700">
              {recipes.length === 0 
                ? "You haven't liked any recipes yet. Start exploring!" 
                : `You have ${recipes.length} saved recipe${recipes.length !== 1 ? 's' : ''}`}
            </p>
          </motion.div>
        </div>

        {recipes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl mb-2">No saved recipes yet</h3>
            <p className="text-gray-600 mb-6">
              Start generating recipes and save your favorites by clicking the heart icon!
            </p>
            <Button 
              onClick={() => onNavigate("home")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Get Started
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1
                }}
              >
                <Card className="relative hover:shadow-xl transition-shadow overflow-hidden h-full">
                  <div 
                    className="relative h-48 flex items-center justify-center"
                    style={{ background: recipe.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
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
                        removeLike(recipe.name);
                      }}
                      className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full p-2 h-auto z-20"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
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
          </div>
        )}
      </div>
    </div>
  );
}