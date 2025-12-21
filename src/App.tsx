import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { DietaryPreferencesPage } from "./components/DietaryPreferencesPage";
import { IngredientsPage } from "./components/IngredientsPage";
import { GoalsPage } from "./components/GoalsPage";
import { RecipesPage } from "./components/RecipesPage";
import { RecipeDetailPage } from "./components/RecipeDetailPage";
import { LikedRecipesPage } from "./components/LikedRecipesPage";
import { FeedbackVisualizationPage } from "./components/FeedbackVisualizationPage";
import { DietaryPreferencesBadge } from "./components/DietaryPreferencesBadge";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [previousPage, setPreviousPage] = useState("home");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [mainGoal, setMainGoal] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [mealType, setMealType] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [hasSetDietaryPreferences, setHasSetDietaryPreferences] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [recipesSuggestions, setRecipesSuggestions] = useState<string | null>(null);

  const handleNavigate = (page: string, data?: any, updateHistory: boolean = true) => {
    console.log("handleNavigate called - from:", currentPage, "to:", page, "updateHistory:", updateHistory);
    
    if (updateHistory) {
      setPreviousPage(currentPage);
      console.log("previousPage will be set to:", currentPage);
    }
    
    setCurrentPage(page);
    
    // Clear cached recipes when starting a new recipe generation flow
    if (page === "ingredients" || page === "goals") {
      setGeneratedRecipes([]);
      setRecipesSuggestions(null);
    }
    
    if (data) {
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.mainGoal) setMainGoal(data.mainGoal);
      if (data.dietaryRestrictions !== undefined) {
        setDietaryRestrictions(data.dietaryRestrictions);
        // Mark that preferences have been set (even if empty)
        if (currentPage === "dietary-preferences" || currentPage === "home") {
          setHasSetDietaryPreferences(true);
        }
      }
      if (data.mealType) setMealType(data.mealType);
      if (data.recipe) setSelectedRecipe(data.recipe);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Show dietary preferences badge on all pages except home, dietary-preferences, and feedback-visualization */}
      {currentPage !== "home" && currentPage !== "dietary-preferences" && currentPage !== "feedback-visualization" && (
        <DietaryPreferencesBadge 
          preferences={dietaryRestrictions}
          onEdit={() => handleNavigate("dietary-preferences", { dietaryRestrictions })}
        />
      )}
      
      {currentPage === "home" && <HomePage onNavigate={handleNavigate} hasSetDietaryPreferences={hasSetDietaryPreferences} />}
      
      {currentPage === "dietary-preferences" && (
        <DietaryPreferencesPage 
          onNavigate={handleNavigate} 
          savedPreferences={dietaryRestrictions}
        />
      )}
      
      {currentPage === "ingredients" && (
        <IngredientsPage onNavigate={handleNavigate} />
      )}
      
      {currentPage === "goals" && (
        <GoalsPage 
          ingredients={ingredients} 
          onNavigate={handleNavigate} 
        />
      )}
      
      {currentPage === "recipes" && (
        <RecipesPage
          ingredients={ingredients}
          mainGoal={mainGoal}
          dietaryRestrictions={dietaryRestrictions}
          mealType={mealType}
          onNavigate={handleNavigate}
          initialRecipes={generatedRecipes}
          initialSuggestions={recipesSuggestions}
          onRecipesGenerated={(recipes, suggestions) => {
            setGeneratedRecipes(recipes);
            setRecipesSuggestions(suggestions);
          }}
        />
      )}
      
      {currentPage === "recipe-detail" && selectedRecipe && (
        <RecipeDetailPage
          recipe={selectedRecipe}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === "liked-recipes" && (
        <LikedRecipesPage 
          onNavigate={handleNavigate}
          previousPage={previousPage}
        />
      )}

      {currentPage === "feedback-visualization" && (
        <FeedbackVisualizationPage 
          onNavigate={handleNavigate}
        />
      )}

      <FeedbackWidget />
      <Toaster />
      <footer className="w-full text-center py-6 mt-10 bg-emerald-100 text-emerald-800 font-semibold">
        <p>🍽️ University Project by Olga Khan</p>
      </footer>
    </div>
  );
}