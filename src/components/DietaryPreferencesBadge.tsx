import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Salad, X, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DietaryPreferencesBadgeProps {
  preferences: string[];
  onEdit: () => void;
}

export function DietaryPreferencesBadge({ preferences, onEdit }: DietaryPreferencesBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const dietaryLabels: Record<string, { label: string; icon: string }> = {
    "vegetarian": { label: "Vegetarian", icon: "🥗" },
    "vegan": { label: "Vegan", icon: "🌱" },
    "gluten-free": { label: "Gluten-Free", icon: "🌾" },
    "dairy-free": { label: "Dairy-Free", icon: "🥛" },
    "keto": { label: "Keto", icon: "🥑" },
    "paleo": { label: "Paleo", icon: "🍖" },
    "low-carb": { label: "Low-Carb", icon: "🥦" },
    "halal": { label: "Halal", icon: "☪️" },
    "kosher": { label: "Kosher", icon: "✡️" },
    "nut-free": { label: "Nut-Free", icon: "🥜" },
  };

  if (preferences.length === 0) {
    return (
      <div className="fixed top-20 right-4 z-40">
        <Button
          onClick={onEdit}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm shadow-lg border-emerald-300 hover:bg-emerald-50"
        >
          <Salad className="h-4 w-4 mr-2" />
          Set Dietary Preferences
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
            >
              <Salad className="h-4 w-4 mr-2" />
              {preferences.length} Dietary {preferences.length === 1 ? "Preference" : "Preferences"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-emerald-300 w-72">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Salad className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-sm">Dietary Preferences</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref) => {
                    const info = dietaryLabels[pref];
                    return (
                      <Badge
                        key={pref}
                        className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300"
                      >
                        {info?.icon} {info?.label}
                      </Badge>
                    );
                  })}
                </div>
                <Button
                  onClick={() => {
                    setIsExpanded(false);
                    onEdit();
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full border-emerald-300 hover:bg-emerald-50"
                >
                  <Edit2 className="h-3 w-3 mr-2" />
                  Edit Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
