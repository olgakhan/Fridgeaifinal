import { Button } from "./ui/button";
import { ChefHat, Sparkles, Heart, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="border-b bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ChefHat className="h-8 w-8 text-white drop-shadow-lg" />
            </motion.div>
            <span className="text-white">FridgeAI</span>
            <Sparkles className="h-4 w-4 text-lime-200 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate('feedback-visualization')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ratings
            </Button>

            <Button
              variant="ghost"
              onClick={() => onNavigate('liked-recipes')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Heart className="h-4 w-4 mr-2" />
              Liked Recipes
            </Button>
            
            {currentPage !== 'home' && currentPage !== 'liked-recipes' && currentPage !== 'feedback-visualization' && (
              <Button
                variant="secondary"
                onClick={() => onNavigate('home')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                Back to Home
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}