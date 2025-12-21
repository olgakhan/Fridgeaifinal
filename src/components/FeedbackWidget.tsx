import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { MessageCircle, X, Send, Smile, Heart, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  const handleSubmit = async () => {
    if (!feedback.trim() && !rating) {
      toast.error("Please provide a rating or feedback!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save feedback to backend
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f49742e/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      // Show success message
      toast.success("Thank you for your feedback! 💚", {
        description: "Your input helps us improve FridgeAI!",
      });

      // Update total feedbacks count
      setTotalFeedbacks(prev => prev + 1);

      // Reset and close
      setFeedback("");
      setRating(null);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error("Oops! Couldn't submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 group"
              size="icon"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="h-7 w-7 text-white" />
              </motion.div>
              
              {/* Notification Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
              >
                !
              </motion.div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Share your thoughts!
                  <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <Card className="shadow-2xl border-2 border-emerald-300 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-white" />
                    <h3 className="text-white font-semibold">We'd Love Your Feedback!</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Rating Section */}
                <div>
                  <label className="text-sm font-semibold text-emerald-800 mb-2 block">
                    How's your experience? 😊
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            rating && star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-emerald-600 mt-2"
                    >
                      {rating === 5 && "Amazing! 🌟"}
                      {rating === 4 && "Great! 👍"}
                      {rating === 3 && "Good! 😊"}
                      {rating === 2 && "Could be better 🤔"}
                      {rating === 1 && "We'll improve! 💪"}
                    </motion.p>
                  )}
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="text-sm font-semibold text-emerald-800 mb-2 block">
                    Any suggestions to improve FridgeAI
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your ideas, bugs, or feature requests..."
                    className="resize-none border-emerald-200 focus:border-emerald-500 min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {feedback.length}/500
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Send className="h-4 w-4" />
                      </motion.div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Feedback
                    </span>
                  )}
                </Button>

                {/* Footer Stats */}
                <div className="pt-4 border-t border-emerald-100">
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    <span>
                      Made by a student, improved by <strong>you</strong>!
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}