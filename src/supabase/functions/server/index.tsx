import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { stream } from "npm:hono/streaming";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-6f49742e/health", (c) => {
  return c.json({ status: "ok" });
});

// Test endpoint to check if API key is configured
app.get("/make-server-6f49742e/check-config", (c) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  return c.json({ 
    hasApiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPrefix: apiKey ? apiKey.substring(0, 7) + "..." : "not set"
  });
});

// Helper function to call OpenAI for recipes
async function generateRecipeBatch(
  apiKey: string,
  ingredients: string[],
  goalInfo: string,
  dietaryInfo: string,
  mealInfo: string,
  count: number
) {
  try {
    const prompt = `You are a professional chef and nutritionist. Generate exactly ${count} diverse recipe suggestions based on the following:

Ingredients available: ${ingredients.join(", ")}
${goalInfo}${dietaryInfo}${mealInfo}

⚠️ CRITICAL DIETARY RESTRICTIONS - HIGHEST PRIORITY - MUST BE ENFORCED:
${dietaryInfo ? `
THESE RULES OVERRIDE EVERYTHING ELSE AND MUST BE FOLLOWED ABSOLUTELY:

- If dietary restrictions include "Halal": 
  🚫 FORBIDDEN INGREDIENTS: pork, bacon, ham, sausage (unless explicitly halal), pepperoni, prosciutto, alcohol, wine, beer, liquor
  ✅ If any of these forbidden ingredients appear in the available ingredients list, COMPLETELY IGNORE THEM - DO NOT USE THEM AT ALL
  ✅ Only use halal-certified meat or clearly halal ingredients

- If dietary restrictions include "Kosher":
  🚫 FORBIDDEN INGREDIENTS: pork, bacon, ham, shellfish, shrimp, crab, lobster, oysters, clams, mixing meat with dairy
  ✅ If any of these forbidden ingredients appear in the available ingredients list, COMPLETELY IGNORE THEM - DO NOT USE THEM AT ALL
  ✅ Only use kosher-certified ingredients

- If dietary restrictions include "Vegan": 
  🚫 FORBIDDEN: ALL meat, poultry, fish, dairy, eggs, honey, gelatin
  ✅ Ignore any animal products from the ingredients list

- If dietary restrictions include "Vegetarian": 
  🚫 FORBIDDEN: meat, poultry, fish
  ✅ Dairy and eggs are allowed

- If dietary restrictions include "Gluten-Free": 
  🚫 FORBIDDEN: wheat, barley, rye, regular pasta, bread, flour
  ✅ Use gluten-free alternatives only

- If dietary restrictions include "Dairy-Free": 
  🚫 FORBIDDEN: milk, cheese, yogurt, butter, cream, ice cream
  ✅ Use dairy-free alternatives

- If dietary restrictions include "Keto": 
  🚫 AVOID: sugar, bread, pasta, rice, potatoes, high-carb foods
  ✅ Focus on high-fat, low-carb ingredients

- If dietary restrictions include "Paleo": 
  🚫 FORBIDDEN: grains, legumes, dairy, processed foods, refined sugar
  ✅ Focus on whole, unprocessed foods

- If dietary restrictions include "Nut-Free": 
  🚫 FORBIDDEN: all nuts, peanuts, almond, cashew, walnut, nut butters
  ✅ Completely exclude from recipes

- If dietary restrictions include "Low-Carb": 
  🚫 MINIMIZE: bread, pasta, rice, sugar, starchy vegetables
  ✅ Focus on proteins and low-carb vegetables

ENFORCEMENT: Before creating any recipe, mentally filter out all incompatible ingredients from the available list. Only use compatible ingredients that meet ALL dietary restrictions.
` : ""}

IMPORTANT: Create recipes using ONLY the compatible ingredients from the available list that meet ALL dietary requirements. Aim for 85-100% match with COMPATIBLE ingredients only.

For each recipe, provide:
1. A creative, appetizing name
2. A brief description (1-2 sentences)
3. Prep time (in minutes)
4. Cook time (in minutes)
5. Number of servings
6. Difficulty level (Easy, Medium, or Hard)
7. Match percentage (how well it uses the available COMPATIBLE ingredients, 0-100) - Aim for 85-100%
8. List of ingredients from the available ingredients that are used (MUST be compatible with ALL dietary restrictions)
9. List of 3-5 additional common ingredients needed (keep minimal - only essentials, and MUST comply with ALL dietary restrictions)
10. Estimated calories per serving
11. Estimated protein in grams per serving
12. Brief cooking instructions (3-5 steps)

Format your response as a valid JSON object with this exact structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "prepTime": "15 min",
      "cookTime": "25 min",
      "servings": 4,
      "difficulty": "Easy",
      "matchPercentage": 92,
      "usedIngredients": ["ingredient1", "ingredient2"],
      "additionalIngredients": ["ingredient3", "ingredient4"],
      "calories": 420,
      "protein": 35,
      "instructions": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}

FINAL REMINDER: Dietary restrictions are MANDATORY and NON-NEGOTIABLE. Filter incompatible ingredients FIRST, then create recipes with what remains!`;

    console.log("📡 Calling OpenAI API...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "You are a professional chef and nutritionist who creates personalized recipe recommendations. You MUST strictly enforce ALL dietary restrictions - they are non-negotiable religious, health, and ethical requirements. Filter out incompatible ingredients before creating recipes. Always respond with valid JSON only, no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error response:", errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("📥 Received OpenAI response");
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure:", JSON.stringify(data));
      throw new Error("Invalid OpenAI response structure");
    }
    
    const content = data.choices[0].message.content;
    console.log("📝 Raw content:", content.substring(0, 100) + "...");
    
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content that failed to parse:", cleanedContent);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
    
    if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
      console.error("Invalid recipe structure:", parsedResponse);
      throw new Error("Response does not contain valid recipes array");
    }
    
    console.log(`✅ Successfully parsed ${parsedResponse.recipes.length} recipes`);
    return parsedResponse.recipes;
    
  } catch (error) {
    console.error("❌ Error in generateRecipeBatch:", error);
    throw error;
  }
}

// AI Recipe Generation Streaming Endpoint with Sequential Calls
app.post("/make-server-6f49742e/generate-recipes", async (c) => {
  return stream(c, async (stream) => {
    try {
      const { ingredients, mainGoal, dietaryRestrictions, mealType } = await c.req.json();

      console.log("🔍 Streaming recipes for:", { ingredients, mainGoal, dietaryRestrictions, mealType });

      // Validate input
      if (!ingredients || ingredients.length === 0) {
        await stream.write(`data: ${JSON.stringify({ error: "No ingredients provided" })}\n\n`);
        return;
      }

      // Get OpenAI API key from environment
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        console.error("❌ OpenAI API key not configured");
        await stream.write(`data: ${JSON.stringify({ error: "OpenAI API key not configured" })}\n\n`);
        return;
      }

      console.log("✅ API key found, generating recipes sequentially...");

      // Build the context
      const dietaryInfo = dietaryRestrictions && dietaryRestrictions.length > 0 
        ? `Dietary restrictions: ${dietaryRestrictions.join(", ")}. ` 
        : "";
      const goalInfo = mainGoal ? `Main goal: ${mainGoal}. ` : "";
      const mealInfo = mealType ? `Meal type: ${mealType}. ` : "";

      // Define gradient backgrounds for recipes
      const gradients = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      ];

      // Generate suggestions message
      const suggestions = ingredients.length < 3 
        ? "Your ingredients are a great start! Consider adding proteins like chicken or tofu, and fresh vegetables to unlock even more delicious recipe possibilities."
        : `Your ingredients make a great base! These recipes maximize what you have. Consider adding complementary items like fresh herbs or spices to elevate your dishes.`;

      // Stream suggestions first
      await stream.write(`data: ${JSON.stringify({ type: "suggestions", data: suggestions })}\n\n`);

      // First call: Generate 3 recipes
      console.log("🔄 Starting first batch (3 recipes)...");
      
      try {
        const batch1 = await generateRecipeBatch(apiKey, ingredients, goalInfo, dietaryInfo, mealInfo, 3);
        console.log(`✅ First batch received: ${batch1.length} recipes`);
        
        for (let i = 0; i < batch1.length; i++) {
          const recipe = {
            ...batch1[i],
            id: i + 1,
            gradient: gradients[i % gradients.length]
          };
          
          await stream.write(`data: ${JSON.stringify({ type: "recipe", data: recipe })}\n\n`);
          console.log(`✅ Streamed recipe ${i + 1}: ${recipe.name}`);
          
          // Small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (batchError) {
        console.error("❌ Error in first batch:", batchError);
        await stream.write(`data: ${JSON.stringify({ error: `First batch error: ${batchError.message}` })}\n\n`);
        return;
      }

      // Second call: Generate 3 more recipes
      console.log("🔄 Starting second batch (3 more recipes)...");
      
      try {
        const batch2 = await generateRecipeBatch(apiKey, ingredients, goalInfo, dietaryInfo, mealInfo, 3);
        console.log(`✅ Second batch received: ${batch2.length} recipes`);
        
        for (let i = 0; i < batch2.length; i++) {
          const recipe = {
            ...batch2[i],
            id: i + 4,
            gradient: gradients[(i + 3) % gradients.length]
          };
          
          await stream.write(`data: ${JSON.stringify({ type: "recipe", data: recipe })}\n\n`);
          console.log(`✅ Streamed recipe ${i + 4}: ${recipe.name}`);
          
          // Small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (batchError) {
        console.error("❌ Error in second batch:", batchError);
        await stream.write(`data: ${JSON.stringify({ error: `Second batch error: ${batchError.message}` })}\n\n`);
        return;
      }

      // Send completion signal
      await stream.write(`data: ${JSON.stringify({ type: "complete" })}\n\n`);
      console.log("✅ Streaming complete");

    } catch (error) {
      console.error("❌ Error in streaming endpoint:", error);
      console.error("Error stack:", error.stack);
      await stream.write(`data: ${JSON.stringify({ error: `Internal server error: ${error.message}` })}\n\n`);
    }
  });
});

// Get liked recipes
app.get("/make-server-6f49742e/liked-recipes", async (c) => {
  try {
    console.log("📖 Fetching liked recipes");
    const likedRecipes = await kv.getByPrefix("liked_recipe_");
    console.log(`✅ Found ${likedRecipes.length} liked recipes`);
    return c.json({ recipes: likedRecipes });
  } catch (error) {
    console.error("❌ Error fetching liked recipes:", error);
    return c.json({ error: "Failed to fetch liked recipes" }, 500);
  }
});

// Add a liked recipe
app.post("/make-server-6f49742e/liked-recipes", async (c) => {
  try {
    const recipe = await c.req.json();
    console.log("❤️ Saving liked recipe:", recipe.name);
    
    // Use recipe name as a unique identifier
    const key = `liked_recipe_${recipe.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    await kv.set(key, recipe);
    
    console.log("✅ Recipe saved successfully");
    return c.json({ success: true, message: "Recipe saved" });
  } catch (error) {
    console.error("❌ Error saving liked recipe:", error);
    return c.json({ error: "Failed to save recipe" }, 500);
  }
});

// Remove a liked recipe
app.delete("/make-server-6f49742e/liked-recipes/:name", async (c) => {
  try {
    const recipeName = c.req.param("name");
    console.log("💔 Removing liked recipe:", recipeName);
    
    const key = `liked_recipe_${recipeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    await kv.del(key);
    
    console.log("✅ Recipe removed successfully");
    return c.json({ success: true, message: "Recipe removed" });
  } catch (error) {
    console.error("❌ Error removing liked recipe:", error);
    return c.json({ error: "Failed to remove recipe" }, 500);
  }
});

// Submit feedback
app.post("/make-server-6f49742e/feedback", async (c) => {
  try {
    const feedbackData = await c.req.json();
    console.log("💬 Receiving feedback:", feedbackData);
    
    // Store feedback with timestamp as unique key
    const timestamp = new Date().getTime();
    const key = `feedback_${timestamp}`;
    
    await kv.set(key, feedbackData);
    
    console.log("✅ Feedback saved successfully");
    return c.json({ success: true, message: "Thank you for your feedback!" });
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    return c.json({ error: "Failed to save feedback" }, 500);
  }
});

// Get all feedback (for visualization)
app.get("/make-server-6f49742e/feedback", async (c) => {
  try {
    console.log("📊 Fetching all feedback");
    const feedbacks = await kv.getByPrefix("feedback_");
    console.log(`✅ Found ${feedbacks.length} feedback entries`);
    return c.json({ feedbacks });
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    return c.json({ error: "Failed to fetch feedback" }, 500);
  }
});

Deno.serve(app.fetch);