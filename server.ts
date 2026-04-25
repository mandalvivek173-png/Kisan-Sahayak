import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FATAL: GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const MODEL_NAME = "gemini-1.5-flash"; // Using 1.5 Flash for better stability

// --- AI Service Logic moved to Server ---

async function getClimateData(location: string, month: string) {
  try {
    if (!apiKey) throw new Error("API Key Missing");
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are a Jharkhand Agriculture Expert. 
Location: ${location}, Month: ${month}.
Provide structured JSON with these EXACT keys: 
climate_zone (e.g. Sub-tropical), 
soil_type_estimation (e.g. Red Soil, Laterite), 
rainfall_pattern (e.g. 1100-1300mm), 
temperature_range (e.g. 15°C - 35°C).
Important: Only respond with the JSON object, no markdown, no extra text.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean potential markdown or extra characters
    text = text.replace(/```json|```/g, "").trim();
    if (!text.startsWith("{")) {
       const start = text.indexOf("{");
       const end = text.lastIndexOf("}");
       if (start !== -1 && end !== -1) {
         text = text.substring(start, end + 1);
       }
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Climate API Error:", error);
    return {
      climate_zone: "Jharkhand Region (झारखंड क्षेत्र)",
      soil_type_estimation: "Red/Laterite Soil (लाल/लैटेराइट मिट्टी)",
      rainfall_pattern: "Moderate (औसत वर्षा)",
      temperature_range: "22°C - 32°C"
    };
  }
}

async function getCropRecommendations(location: string, month: string, climateData: any) {
  try {
    if (!apiKey) throw new Error("API Key Missing");
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are an expert Agricultural Advisor for Jharkhand.
District: ${location}
Month: ${month}
Climate Info: ${JSON.stringify(climateData)}

Please provide a detailed report in simple Hindi:
- General Overview (Climate & Soil for this district)
- Top 5 suitable crops for this season
- Which one is most profitable and why

Tone: Use very helpful, professional, and regional Hindi language.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Recommendation API Error:", error);
    return "क्षमा करें, वर्तमान में सुझाव प्राप्त नहीं हो सके। कृपया सुनिश्चित करें कि API Key सही है।";
  }
}

async function getDetailedInsight(type: string, data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    let prompt = "";
    
    const context = `You are a Jharkhand Agriculture Expert. Crop: ${data.crop}, Location: ${data.location}. Area: ${data.acres} Acres.`;

    switch(type) {
      case 'protocol':
        prompt = `${context} Provide details on:
A. Beej (Quantity per acre, best varieties).
B. Sowing Method (Step-by-step).
Answer in simple Hindi.`;
        break;
      case 'resources':
        prompt = `${context} Provide details on:
B. Fertilizer: Urea, DAP, Potash amount per acre (kg).
C. Paani: Irrigation requirements.
Answer in simple Hindi.`;
        break;
      case 'economics':
        prompt = `${context} Provide details on:
D. Cost: Total cost per acre (range).
E. Production: Yield (quintal per acre).
F. Market: Average selling price.
G. Profit: Approx net profit per acre.
Answer in simple Hindi.`;
        break;
      case 'risk':
        prompt = `${context} Provide details on:
5. Risk: Weather risk, Pest risk, Market risk.
6. Expert Advice: How to increase yield and reduce cost.
Answer in simple Hindi.`;
        break;
    }
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "विवरण अभी उपलब्ध नहीं है।";
  }
}

// --- API Routes ---

app.post("/api/analyze", async (req, res) => {
  const { location, month } = req.body;
  try {
    const climate = await getClimateData(location, month);
    const recs = await getCropRecommendations(location, month, climate);
    res.json({ climate, recommendations: recs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/api/insight", async (req, res) => {
  const { type, data } = req.body;
  try {
    const content = await getDetailedInsight(type, data);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: "Insight failed" });
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Professional Agri-Server running at http://localhost:${PORT}`);
  });
}

startServer();
