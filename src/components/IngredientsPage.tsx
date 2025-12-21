import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plus, X, ArrowRight, Refrigerator, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IngredientsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function IngredientsPage({ onNavigate }: IngredientsPageProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const addIngredient = () => {
    if (currentInput.trim() && !ingredients.includes(currentInput.trim())) {
      setIngredients([...ingredients, currentInput.trim()]);
      setCurrentInput("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const handleContinue = () => {
    if (ingredients.length > 0) {
      onNavigate('goals', { ingredients });
    }
  };

  const quickAdd = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const commonIngredients = [
    "Chicken", "Eggs", "Milk", "Cheese", "Tomatoes", 
    "Onions", "Garlic", "Rice", "Pasta", "Bread",
    "Potatoes", "Carrots", "Broccoli", "Spinach", "Bell Peppers"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 py-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="flex justify-center"
              animate={{ 
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-xl opacity-50"></div>
                <Refrigerator className="h-16 w-16 text-emerald-600 relative z-10" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              What's in Your Fridge? 🍎
            </h1>
            <p className="text-gray-700 max-w-2xl mx-auto">
              List all the ingredients you have available. The more you add, the better our AI can suggest recipes! ✨
            </p>
          </motion.div>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="border-2 border-emerald-200 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-white to-emerald-50">
              <CardHeader>
                <CardTitle className="text-emerald-700">Add Ingredients 🥘</CardTitle>
                <CardDescription>
                  Type an ingredient and press Enter or click Add
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., chicken, tomatoes, pasta..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-2 border-emerald-200 focus:border-emerald-400"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={addIngredient} 
                      disabled={!currentInput.trim()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </motion.div>
                </div>

                {/* Current Ingredients */}
                {ingredients.length > 0 && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-gray-700">Your ingredients ({ingredients.length}): 🎉</p>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {ingredients.map((ingredient, index) => (
                          <motion.div
                            key={ingredient}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Badge 
                              variant="secondary"
                              className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg"
                            >
                              {ingredient}
                              <button
                                onClick={() => removeIngredient(ingredient)}
                                className="ml-2 hover:text-red-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Add Common Ingredients */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="border-2 border-teal-200 shadow-xl shadow-teal-500/20 bg-gradient-to-br from-white to-teal-50">
              <CardHeader>
                <CardTitle className="text-teal-700">Quick Add Common Ingredients 🍅</CardTitle>
                <CardDescription>
                  Click to quickly add popular ingredients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonIngredients.map((ingredient, index) => (
                    <motion.div
                      key={ingredient}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant="outline"
                        className={`cursor-pointer hover:bg-gradient-to-r hover:from-teal-100 hover:to-green-100 px-3 py-1.5 transition-all ${
                          ingredients.includes(ingredient) 
                            ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white border-teal-400' 
                            : 'border-teal-300'
                        }`}
                        onClick={() => quickAdd(ingredient)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {ingredient}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Continue Button */}
          <motion.div 
            className="flex justify-center pt-4 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={ingredients.length === 0}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-emerald-500/50"
              >
                Continue to Goals
                <ArrowRight className="ml-2 h-5 w-5" />
                <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
