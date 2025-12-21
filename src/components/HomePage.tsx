import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChefHat, Sparkles, UtensilsCrossed, Target, Flame, Star, Cookie, Apple, Pizza } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

interface HomePageProps {
  onNavigate: (page: string) => void;
  hasSetDietaryPreferences: boolean;
}

export function HomePage({ onNavigate, hasSetDietaryPreferences }: HomePageProps) {
  // Floating food icons
  const floatingIcons = [
    { Icon: Cookie, delay: 0, x: 20, y: 30 },
    { Icon: Apple, delay: 0.5, x: 80, y: 70 },
    { Icon: Pizza, delay: 1, x: 15, y: 85 },
    { Icon: UtensilsCrossed, delay: 1.5, x: 85, y: 20 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 overflow-y-auto relative">

      {/* ✅ University Project Label */}
      <div className="absolute top-4 right-4 z-50">
        <span className="bg-emerald-700 text-white text-xs font-semibold py-1 px-3 rounded-full shadow-lg">
          🎓 University Project
        </span>
      </div>
      
      {/* Floating Background Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10 pointer-events-none hidden lg:block"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 5,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <item.Icon className="h-24 w-24 text-emerald-600" />
        </motion.div>
      ))}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Chef Icon */}
          <motion.div
            className="flex justify-center"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <ChefHat className="h-20 w-20 text-emerald-600 relative z-10" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent text-5xl md:text-6xl lg:text-7xl font-bold"

              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              Turn Your Fridge Into Delicious Meals ✨
            </motion.h1>

            <motion.p
              className="text-gray-700 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Simply tell us what ingredients you have, set your dietary goals,
              and let our AI chef suggest personalized recipes tailored just for
              you. 🍳
            </motion.p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => onNavigate(hasSetDietaryPreferences ? "ingredients" : "dietary-preferences")}
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl hover:shadow-emerald-500/50" style={{height:"50px"}}
            >
              <span className="flex items-center" style={{fontSize:"24px"}}>
                Get Started
                <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
              </span>
            </Button>
          </motion.div>

        </motion.div>

        {/* Hero Image */}
        <motion.div
          className="mt-16 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 group"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1759691554646-8155da2172ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZnJpZGdlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYyMjY5MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Minimalistic fridge with fresh ingredients"
              className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/30 to-transparent group-hover:from-emerald-600/40 transition-all duration-300"></div>
          </div>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto px-6">


          {/* Ingredients Feature */}
          <motion.div whileHover={{ y: -10 }}>
            <Card
              className="cursor-pointer border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-2xl"
              onClick={() => onNavigate("ingredients")}
            >
              <CardHeader>
                <UtensilsCrossed className="h-10 w-10 text-green-700 mb-3" />
                <CardTitle className="font-bold text-green-700">List Your Ingredients 🥕</CardTitle>
                <CardDescription>Tell us what's in your kitchen, and we'll help find the best recipe match.<br /><br />
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Goals Feature */}
          <motion.div whileHover={{ y: -10 }}>
            <Card
              className="cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 transition-all hover:shadow-2xl"
              onClick={() => onNavigate("goals")}
            >
              <CardHeader>
                <Target className="h-10 w-10 text-emerald-700 mb-3" />
                <CardTitle className="font-bold text-emerald-700">Set Your Goals 🎯</CardTitle>
                <CardDescription>Select what matters most — diet, taste, time, nutrition — and let AI adapt. <br /> <br /></CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Recipes Feature */}
          <motion.div whileHover={{ y: -10 }}>
            <Card
              className="cursor-pointer border-2 border-teal-200 hover:border-teal-400 transition-all hover:shadow-2xl"
              onClick={() => onNavigate("recipes")}
            >
              <CardHeader>
                <Sparkles className="h-10 w-10 text-teal-700 mb-3" />
                <CardTitle className="font-bold text-teal-700">Get AI Recipes ✨</CardTitle>
                <CardDescription> Discover new meals instantly. Save favorites and share your creations!<br /> <br /></CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <Card className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center space-y-6">
<h2 style={{ fontWeight: "bold", fontSize: "24px", marginBottom: "20px" }}>
  Ready to Cook Smart 🔥
</h2>

              <p className="text-white/90 max-w-2xl mx-auto">
                Make the most of what you already have!
              </p>
              <Button
                size="lg"
                onClick={() => onNavigate("ingredients")}
                className="bg-white text-emerald-700 shadow-xl hover:bg-emerald-50"
              >
                <Flame className="mr-2 h-5 w-5" />
                Start Cooking
                <Star className="ml-2 h-5 w-5 text-yellow-500" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div> 

    </div>
  )
}
