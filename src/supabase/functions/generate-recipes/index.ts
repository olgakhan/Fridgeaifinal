// Helper function to call OpenAI for recipes
async function generateRecipeBatch(
  apiKey: string,
  ingredients: string[],
  goalInfo: string,
  dietaryInfo: string,
  mealInfo: string,
  count: number
) {
  const prompt = `You are a professional chef and nutritionist. Generate exactly ${count} diverse recipe suggestions based on the following:

Ingredients available: ${ingredients.join(", ")}
${goalInfo}${dietaryInfo}${mealInfo}

IMPORTANT: Focus on creating recipes that use MOSTLY the available ingredients. The goal is to maximize the use of what the user already has (aim for 85-100% match).

For each recipe, provide:
1. A creative, appetizing name
2. A brief description (1-2 sentences)
3. Prep time (in minutes)
4. Cook time (in minutes)
5. Number of servings
6. Difficulty level (Easy, Medium, or Hard)
7. Match percentage (how well it uses the available ingredients, 0-100) - Try to keep this ABOVE 85%
8. List of ingredients from the available ingredients that are used
9. List of 3-5 additional common ingredients needed (keep this minimal - only essentials like salt, oil, water, or 1-2 key ingredients)
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

Make the recipes diverse, practical, and appealing. Ensure they align with the dietary goals and restrictions if provided. Prioritize using what the user already has!`;

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
          content: "You are a professional chef and nutritionist who creates personalized recipe recommendations. Always respond with valid JSON only, no additional text."
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
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid OpenAI response structure");
  }
  
  const content = data.choices[0].message.content;
  const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
  const parsedResponse = JSON.parse(cleanedContent);
  
  return parsedResponse.recipes || [];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  }

  try {
    const body = await req.json();
    const { ingredients, mainGoal, dietaryRestrictions, mealType } = body;

    console.log("🔍 Generating recipes for:", { ingredients, mainGoal, dietaryRestrictions, mealType });

    // Validate ingredients
    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No ingredients provided" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          } 
        }
      );
    }

    // Get OpenAI API key
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("❌ OpenAI API key not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          } 
        }
      );
    }

    // Build the context
    const dietaryInfo = dietaryRestrictions && dietaryRestrictions.length > 0 
      ? `Dietary restrictions: ${dietaryRestrictions.join(", ")}. ` 
      : "";
    const goalInfo = mainGoal ? `Main goal: ${mainGoal}. ` : "";
    const mealInfo = mealType ? `Meal type: ${mealType}. ` : "";

    // Define gradient backgrounds
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];

    // Generate suggestions
    const suggestions = ingredients.length < 3 
      ? "Your ingredients are a great start! Consider adding proteins like chicken or tofu, and fresh vegetables to unlock even more delicious recipe possibilities."
      : `Your ingredients make a great base! These recipes maximize what you have. Consider adding complementary items like fresh herbs or spices to elevate your dishes.`;

    // Generate both batches
    console.log("🔄 Starting first batch (3 recipes)...");
    const batch1 = await generateRecipeBatch(apiKey, ingredients, goalInfo, dietaryInfo, mealInfo, 3);
    console.log(`✅ First batch received: ${batch1.length} recipes`);

    console.log("🔄 Starting second batch (3 more recipes)...");
    const batch2 = await generateRecipeBatch(apiKey, ingredients, goalInfo, dietaryInfo, mealInfo, 3);
    console.log(`✅ Second batch received: ${batch2.length} recipes`);

    // Combine all recipes
    const allRecipes = [
      ...batch1.map((recipe, i) => ({
        ...recipe,
        id: i + 1,
        gradient: gradients[i % gradients.length]
      })),
      ...batch2.map((recipe, i) => ({
        ...recipe,
        id: i + 4,
        gradient: gradients[(i + 3) % gradients.length]
      }))
    ];

    console.log(`✅ Returning ${allRecipes.length} recipes`);

    // Return all recipes at once
    return new Response(
      JSON.stringify({
        suggestions,
        recipes: allRecipes
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      }
    );

  } catch (err) {
    console.error("❌ Request error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Request failed" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        } 
      }
    );
  }
});
