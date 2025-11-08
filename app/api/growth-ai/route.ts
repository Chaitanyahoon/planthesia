import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

interface UserContext {
  today: string
  todayTasks: number
  todayPomodoros: number
  overdueTasks: number
  pendingTasks: number
  completionRate: number
  totalTasks: number
  totalPomodoros: number
  streak: number
}

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()
    console.log("[Growth AI] Received request:", { messageLength: message?.length, hasContext: !!context })

    // Check for API key first
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.trim() === "") {
      console.error("[Growth AI] GEMINI_API_KEY environment variable is not set or empty")
      return Response.json(
        { 
          error: "Gemini API key not configured",
          details: "Please set the GEMINI_API_KEY environment variable in your .env.local file"
        },
        { status: 500 }
      )
    }

    // Initialize client with API key
    let client: any
    let initAttempts = 0
    const maxAttempts = 3

    while (initAttempts < maxAttempts) {
      try {
        console.log(`[Growth AI] Attempting to initialize client (attempt ${initAttempts + 1}/${maxAttempts})`)
        client = new GoogleGenerativeAI(apiKey)
        console.log("[Growth AI] Client initialized successfully")
        break
      } catch (initErr) {
        initAttempts++
        console.error(`[Growth AI] Failed to initialize client (attempt ${initAttempts}/${maxAttempts}):`, initErr)
        
        if (initAttempts === maxAttempts) {
          throw new Error("Failed to initialize Gemini AI client after multiple attempts")
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * initAttempts))
      }
    }

    // Initialize with gemini-2.0-flash model
    const model = client.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    })

    const systemPrompt = `You are Growth AI, a compassionate and intelligent productivity assistant integrated into the ProdoAI dashboard.

CURRENT USER CONTEXT:
- Today's Tasks Completed: ${context.todayTasks}
- Today's Focus Sessions: ${context.todayPomodoros} (${(context.todayPomodoros * 25) / 60} hours)
- Pending Tasks: ${context.pendingTasks}
- Overdue Tasks: ${context.overdueTasks}
- Overall Completion Rate: ${context.completionRate}%
- Current Streak: ${context.streak} days
- Total Tasks Created: ${context.totalTasks}
- Total Focus Sessions: ${context.totalPomodoros}

GUIDELINES:
1. Always be encouraging, warm, and supportive - use appropriate emojis
2. Provide specific, actionable advice tailored to their current situation
3. Reference their data points when giving recommendations
4. Adapt your tone to their emotional state
5. Offer both immediate tips and longer-term strategies
6. Balance motivation with realistic expectations
7. Keep responses clear and structured
8. Include practical techniques they can implement right now
9. Be honest about challenges while maintaining optimism

SPECIAL INSTRUCTIONS FOR TASK CREATION:
- When user asks to add/create tasks, structure response with clear task recommendations
- Include: Task Title | Suggested Duration | Best Time | Priority | Category
- Format as: "TASK_SUGGESTION: [title] | [duration]min | [time] | [priority] | [category]"
- For recurring patterns, suggest multiple tasks
- Always explain the breakdown and timing strategy

RESPONSE FORMAT:
- Use markdown with bold for headers
- Include relevant emojis
- Structure clearly with sections
- Provide actionable takeaways
- End with encouraging statement

You are their personal growth coach! 🌱`

    console.log("[Growth AI] Calling Gemini 2.0 Flash with model: gemini-2.0-flash")

    console.log("[Growth AI] Sending request to Gemini...")
    
    // Add retry logic for content generation
    let result;
    let attempts = 0;
    const maxGenerationAttempts = 3;

    while (attempts < maxGenerationAttempts) {
      try {
        console.log(`[Growth AI] Attempting to generate content (attempt ${attempts + 1}/${maxGenerationAttempts})`)
        
        result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{
              text: `${systemPrompt}\n\nUSER MESSAGE: ${message}`
            }]
          }],
          generationConfig: {
            stopSequences: ["USER MESSAGE:"],
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        })

        if (result && result.response) {
          console.log("[Growth AI] Content generated successfully")
          break
        } else {
          throw new Error("Empty response from model")
        }
      } catch (genErr) {
        attempts++
        console.error(`[Growth AI] Generation attempt ${attempts} failed:`, genErr)
        
        if (attempts === maxGenerationAttempts) {
          throw new Error(`Failed to generate content after ${maxGenerationAttempts} attempts`)
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)))
      }
    }

    const response = await result.response
    console.log("[Growth AI] Gemini response received successfully:", { 
      hasResponse: !!response,
      hasText: !!response.text 
    })

    // Extract and validate text from the Flash model response
    let responseText = ""
    try {
      console.log("[Growth AI] Attempting to extract response text")
      
      // Try multiple extraction methods
      if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        responseText = response.candidates[0].content.parts[0].text
        console.log("[Growth AI] Extracted text from candidates array")
      } else if (typeof response?.text === "function") {
        responseText = await response.text()
        console.log("[Growth AI] Extracted text using text() function")
      } else if (response?.content?.parts?.[0]?.text) {
        responseText = response.content.parts[0].text
        console.log("[Growth AI] Extracted text from content parts")
      } else if (typeof response?.text === "string") {
        responseText = response.text
        console.log("[Growth AI] Extracted text from text property")
      } else if (typeof response === "string") {
        responseText = response
        console.log("[Growth AI] Used response as direct string")
      }

      // Validate extracted text
      if (!responseText || typeof responseText !== "string") {
        console.error("[Growth AI] Invalid response text format:", responseText)
        throw new Error("Invalid response format from Gemini Flash")
      }

      // Clean and validate the response
      responseText = responseText.trim()
      if (responseText.length === 0) {
        throw new Error("Empty response from Gemini Flash")
      }
      
      console.log("[Growth AI] Successfully extracted and validated response text")
    } catch (e) {
      console.error("[Growth AI] Failed to process Flash model response:", e)
      throw new Error(`Failed to process Gemini Flash response: ${e instanceof Error ? e.message : String(e)}`)
    }

    console.log("[Growth AI] Response text extracted, length:", (responseText || "").length)

    const taskSuggestions: Array<{
      title: string
      duration: number
      time: string
      priority: "low" | "medium" | "high"
      category: "work" | "personal" | "learning" | "health"
    }> = []

    const taskMatches = responseText.match(/TASK_SUGGESTION:\s*([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\n]+)/g) || []
    taskMatches.forEach((match) => {
      const parts = match
        .replace("TASK_SUGGESTION:", "")
        .split("|")
        .map((p) => p.trim())
      if (parts.length === 5) {
        const duration = Number.parseInt(parts[1]) || 25
        const priority = (parts[3].toLowerCase() as "low" | "medium" | "high") || "medium"
        const category = (parts[4].toLowerCase() as "work" | "personal" | "learning" | "health") || "learning"

        taskSuggestions.push({
          title: parts[0],
          duration,
          time: parts[2],
          priority,
          category,
        })
      }
    })

    // Clean response by removing task suggestion format
    const cleanedResponse = responseText
      .split("\n")
      .filter((line) => !line.includes("TASK_SUGGESTION:"))
      .join("\n")
      .trim()

    return Response.json(
      {
        response: cleanedResponse,
        taskSuggestions: taskSuggestions.length > 0 ? taskSuggestions : undefined,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("[Growth AI] Error occurred:", error)

    const fallbackMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorData = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : {}

    // Extract error details from various possible error structures
    const responseData = (errorData.response ?? {}) as Record<string, unknown>
    const responseStatus = typeof responseData.status === "number" ? responseData.status : undefined
    const responseError = (responseData.error ?? {}) as Record<string, unknown>
    const responseMessage =
      typeof responseError.message === "string"
        ? responseError.message
        : typeof responseData.statusText === "string"
          ? responseData.statusText
          : undefined

    let status = typeof errorData.status === "number" ? errorData.status : responseStatus ?? 500
    let details = responseMessage ?? fallbackMessage

    // Enhanced error detection and messaging
    if (typeof details === "string") {
      const normalized = details.toLowerCase()
      
      if (normalized.includes("api key") || normalized.includes("api_key") || normalized.includes("invalid api key")) {
        status = 401
        details = "Gemini API key is invalid or expired. Please verify your GEMINI_API_KEY in the .env.local file."
        console.error("[Growth AI] API key validation failed")
      } else if (normalized.includes("quota") || normalized.includes("rate limit")) {
        status = 429
        details = "Gemini API quota exceeded or rate limit reached. Please try again later."
        console.error("[Growth AI] Rate limit or quota exceeded")
      } else if (normalized.includes("model") || normalized.includes("not found")) {
        status = 400
        details = "Gemini model not found. Please check the model name configuration."
        console.error("[Growth AI] Model not found error")
      } else if (normalized.includes("network") || normalized.includes("timeout")) {
        status = 503
        details = "Network error or timeout connecting to Gemini API. Please try again."
        console.error("[Growth AI] Network or timeout error")
      }
    }

    // Log full error for debugging
    if (error instanceof Error) {
      console.error("[Growth AI] Error stack:", error.stack)
    }

    return Response.json(
      {
        error: "Failed to generate response from Growth AI",
        details,
      },
      { status },
    )
  }
}
