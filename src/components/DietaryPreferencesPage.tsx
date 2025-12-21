import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Salad, Check, Info } from "lucide-react";
import { motion } from "motion/react";

interface DietaryPreferencesPageProps {
  onNavigate: (page: string, data?: any) => void;
  savedPreferences?: string[];
}

export function DietaryPreferencesPage({ onNavigate, savedPreferences = [] }: DietaryPreferencesPageProps) {
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(savedPreferences);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const dietaryOptions = [
    { 
      id: "vegetarian", 
      label: "Vegetarian", 
      icon: "🥗",
      description: "No meat, fish, or poultry. Includes dairy and eggs."
    },
    { 
      id: "vegan", 
      label: "Vegan", 
      icon: "🌱",
      description: "No animal products at all, including dairy, eggs, and honey."
    },
    { 
      id: "gluten-free", 
      label: "Gluten-Free", 
      icon: "🌾",
      description: "No wheat, barley, rye, or gluten-containing grains."
    },
    { 
      id: "dairy-free", 
      label: "Dairy-Free", 
      icon: "🥛",
      description: "No milk, cheese, butter, or any dairy products."
    },
    { 
      id: "keto", 
      label: "Keto", 
      icon: "🥑",
      description: "High-fat, very low-carb diet (typically under 20-50g carbs/day)."
    },
    { 
      id: "paleo", 
      label: "Paleo", 
      icon: "🍖",
      description: "Foods our ancestors ate: meat, fish, vegetables, fruits, nuts."
    },
    { 
      id: "low-carb", 
      label: "Low-Carb", 
      icon: "🥦",
      description: "Reduced carbohydrate intake, focusing on proteins and fats."
    },
    { 
      id: "halal", 
      label: "Halal", 
      icon: "☪️",
      description: "Food prepared according to Islamic dietary laws."
    },
    { 
      id: "kosher", 
      label: "Kosher", 
      icon: "✡️",
      description: "Food prepared according to Jewish dietary laws."
    },
    { 
      id: "nut-free", 
      label: "Nut-Free", 
      icon: "🥜",
      description: "No tree nuts or peanuts (safe for nut allergies)."
    },
  ];

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleContinue = () => {
    onNavigate("ingredients", { dietaryRestrictions: selectedRestrictions });
  };

  const handleSkip = () => {
    onNavigate("ingredients", { dietaryRestrictions: [] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-2 border-emerald-200">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                  <Salad className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl">Set Your Dietary Preferences</CardTitle>
              <CardDescription className="text-lg">
                Select any dietary restrictions or preferences. Don't worry, you can change these anytime!
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dietaryOptions.map((option) => {
                  const isSelected = selectedRestrictions.includes(option.id);
                  const isHovered = hoveredOption === option.id;
                  return (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                      style={{ zIndex: isHovered ? 50 : 1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-emerald-600 shadow-lg"
                            : "hover:border-emerald-400 hover:shadow-md"
                        }`}
                        onClick={() => toggleRestriction(option.id)}
                        onMouseEnter={() => setHoveredOption(option.id)}
                        onMouseLeave={() => setHoveredOption(null)}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-6 relative">
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                              <Check className="h-4 w-4 text-emerald-600" />
                            </div>
                          )}
                          <div className="text-4xl mb-2">{option.icon}</div>
                          <div className="text-center font-semibold">{option.label}</div>
                        </CardContent>
                      </Card>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-50 top-full mt-2 left-1/2 transform -translate-x-1/2 w-64 bg-white border-2 border-emerald-300 rounded-lg p-3 shadow-xl"
                        >
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-emerald-300 rotate-45"></div>
                          <p className="text-sm text-gray-700 text-center relative z-10 bg-white">{option.description}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {selectedRestrictions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-emerald-50 border border-emerald-300 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-emerald-900 mb-2">Selected Preferences:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestrictions.map((restriction) => {
                      const option = dietaryOptions.find(o => o.id === restriction);
                      return (
                        <Badge
                          key={restriction}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                        >
                          {option?.icon} {option?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}