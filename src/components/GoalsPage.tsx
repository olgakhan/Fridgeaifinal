import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ArrowRight, Target, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";

interface GoalsPageProps {
  ingredients: string[];
  onNavigate: (page: string, data?: any) => void;
}

export function GoalsPage({ ingredients, onNavigate }: GoalsPageProps) {
  const [mainGoal, setMainGoal] = useState("balanced");
  const [mealType, setMealType] = useState("any");

  const handleGetRecipes = () => {
    onNavigate('recipes', {
      ingredients,
      mainGoal,
      mealType
    });
  };

  const goals = [
    { value: "weight-loss", label: "Weight Loss", description: "Lower calorie, high protein meals" },
    { value: "muscle-gain", label: "Muscle Gain", description: "High protein, balanced nutrients" },
    { value: "balanced", label: "Balanced Diet", description: "Well-rounded, nutritious meals" },
    { value: "quick-easy", label: "Quick & Easy", description: "Simple recipes, minimal prep" },
  ];

  const mealTypes = [
    { value: "any", label: "Any Meal" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 py-12 overflow-y-auto">
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
                rotate: [0, 10, -10, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-lime-400 to-emerald-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Target className="h-16 w-16 text-lime-600 relative z-10" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 bg-clip-text text-transparent">
              Set Your Goals 🎯
            </h1>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Tell us about your dietary preferences and goals so we can suggest the perfect recipes for you! 🌟
            </p>
          </motion.div>

          {/* Main Goal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="border-2 border-lime-200 shadow-xl shadow-lime-500/20 bg-gradient-to-br from-white to-lime-50">
              <CardHeader>
                <CardTitle className="text-lime-700">Primary Goal 🏆</CardTitle>
                <CardDescription>
                  What's your main objective with these meals?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={mainGoal} onValueChange={setMainGoal}>
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <motion.div 
                        key={goal.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          mainGoal === goal.value 
                            ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white border-lime-400 shadow-lg' 
                            : 'border-lime-200 hover:bg-lime-50 hover:border-lime-300'
                        }`}>
                          <RadioGroupItem value={goal.value} id={goal.value} className="mt-1" />
                          <Label htmlFor={goal.value} className="flex-1 cursor-pointer">
                            <div>
                              <div className={mainGoal === goal.value ? 'text-white' : ''}>{goal.label}</div>
                              <div className={mainGoal === goal.value ? 'text-white/90' : 'text-gray-500'}>{goal.description}</div>
                            </div>
                          </Label>
                          {mainGoal === goal.value && <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Meal Type */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="border-2 border-emerald-200 shadow-xl shadow-emerald-500/20 bg-gradient-to-br from-white to-emerald-50">
              <CardHeader>
                <CardTitle className="text-emerald-700">Meal Type 🍽️</CardTitle>
                <CardDescription>
                  What type of meal are you looking for?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={mealType} onValueChange={setMealType}>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {mealTypes.map((type, index) => (
                      <motion.div 
                        key={type.value}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          mealType === type.value 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-lg' 
                            : 'border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}>
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Label htmlFor={type.value} className="cursor-pointer whitespace-nowrap">
                            {type.label}
                          </Label>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Get Recipes Button */}
          <motion.div 
            className="flex justify-center pt-4 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={handleGetRecipes}
                className="bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 hover:from-green-700 hover:via-lime-700 hover:to-emerald-700 shadow-2xl hover:shadow-lime-500/50"
              >
                <Zap className="mr-2 h-5 w-5 animate-pulse" />
                Get Recipe Suggestions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}