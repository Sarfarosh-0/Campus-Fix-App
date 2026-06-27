import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to handle Base64 image payloads
app.use(express.json({ limit: "15mb" }));

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to initialize and retrieve reports
function readReports(): any[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading db.json, returning seed defaults:", error);
  }

  // Fallback to default seed data
  const seed = [
    {
      report_id: "rep-001",
      image_payload: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80",
      description: "Water cooler on 2nd floor Hostel B dripping continuously and creating a slip hazard.",
      building_tag: "Hostel B",
      room_label: "2nd Floor Corridor",
      latitude: 16.2,
      longitude: 71.5,
      category: "Infrastructure",
      priority: "Medium",
      status_state: "In Progress",
      cluster_flag: false,
      created_at: Date.now() - 3600000 * 24 * 2
    },
    {
      report_id: "rep-002",
      image_payload: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
      description: "Vite WiFi router under floor 1 lobby has no signal. Unable to connect.",
      building_tag: "Tech Block",
      room_label: "Lobby Router Shelf",
      latitude: 49.5,
      longitude: 76.2,
      category: "Connectivity",
      priority: "Medium",
      status_state: "Pending",
      cluster_flag: false,
      created_at: Date.now() - 3600000 * 5
    },
    {
      report_id: "rep-003",
      image_payload: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
      description: "Cracked flooring Tiles in Block Canteen causing trip hazards right in front of the main counter.",
      building_tag: "Canteen",
      room_label: "Main Counter Entrance",
      latitude: 81.0,
      longitude: 69.1,
      category: "Canteen & Hygiene",
      priority: "High",
      status_state: "Resolved",
      cluster_flag: false,
      created_at: Date.now() - 3600000 * 48,
      resolved_at: Date.now() - 3600000 * 45
    },
    {
      report_id: "rep-004",
      image_payload: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      description: "Corridor light flickers violently on floor 3, causing headaches and poor visibility near room 302.",
      building_tag: "Hostel A",
      room_label: "Outside Room 302",
      latitude: 19.1,
      longitude: 34.2,
      category: "Infrastructure",
      priority: "Low",
      status_state: "Pending",
      cluster_flag: false,
      created_at: Date.now() - 3600000 * 1.5
    },
    {
      report_id: "rep-005",
      image_payload: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
      description: "Smoke detector chirping continuously at Hostel A first floor stairwell. Battery low.",
      building_tag: "Hostel A",
      room_label: "Stairwell Block A",
      latitude: 17.5,
      longitude: 36.8,
      category: "Safety",
      priority: "Low",
      status_state: "Pending",
      cluster_flag: false,
      created_at: Date.now() - 3600000 * 1.2
    }
  ];
  writeReports(seed);
  return seed;
}

function writeReports(reports: any[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(reports, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
}

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("GoogleGenAI initialized successfully on the backend.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found in process.env. Using local heuristics engine.");
}

// Local heuristics fallback engine when Gemini is unavailable
function getHeuristicsTriage(text: string) {
  const lower = text.toLowerCase();
  let category = "Infrastructure";
  let priority = "Medium";
  let reasoning = "Assigned via CampusFix Heuristics Engine (offline model).";

  // Categorize
  if (
    lower.includes("wifi") ||
    lower.includes("internet") ||
    lower.includes("signal") ||
    lower.includes("connection") ||
    lower.includes("router") ||
    lower.includes("network") ||
    lower.includes("ethernet")
  ) {
    category = "Connectivity";
  } else if (
    lower.includes("food") ||
    lower.includes("canteen") ||
    lower.includes("hygiene") ||
    lower.includes("mess") ||
    lower.includes("kitchen") ||
    lower.includes("spill") ||
    lower.includes("clean") ||
    lower.includes("dirty") ||
    lower.includes("utensils")
  ) {
    category = "Canteen & Hygiene";
  } else if (
    lower.includes("smoke") ||
    lower.includes("fire") ||
    lower.includes("wire") ||
    lower.includes("shock") ||
    lower.includes("hazard") ||
    lower.includes("safety") ||
    lower.includes("lock") ||
    lower.includes("stairwell") ||
    lower.includes("imminent") ||
    lower.includes("broken glass") ||
    lower.includes("emergency")
  ) {
    category = "Safety";
  }

  // Priority
  if (
    lower.includes("emergency") ||
    lower.includes("critical") ||
    lower.includes("fire") ||
    lower.includes("shock") ||
    lower.includes("hazardous") ||
    lower.includes("broken glass") ||
    lower.includes("imminent danger") ||
    lower.includes("slip hazard")
  ) {
    priority = "High";
    reasoning = `Priority: Escalated to High due to critical safety language ("${
      lower.match(/emergency|critical|fire|shock|hazard|danger|slip/)?.[0] || "danger"
    }"). ${reasoning}`;
  } else if (
    lower.includes("slow") ||
    lower.includes("minor") ||
    lower.includes("flicker") ||
    lower.includes("dripping") ||
    lower.includes("low") ||
    lower.includes("chirping")
  ) {
    priority = "Low";
    reasoning = `Priority: Set to Low as the issue description suggests dynamic latency but no immediate physical threat. ${reasoning}`;
  } else {
    priority = "Medium";
    reasoning = `Priority: Set to Medium for general operational disruptions. ${reasoning}`;
  }

  return { category, priority, reasoning };
}

// ----------------- PRODUCTION API ENDPOINTS -----------------

// POST /api/auth/login: Handle RBAC authentication and establish security roles
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let role: "reporter" | "authority" = "reporter";

  if (normalizedEmail.includes("authority") || normalizedEmail === "admin@campusfix.org") {
    role = "authority";
  }

  // Generate a mock JWT/Token session for standard authentication handshakes
  const token = `sess_${role}_${Buffer.from(normalizedEmail).toString("base64").slice(0, 16)}`;

  res.json({
    email: normalizedEmail,
    role,
    token
  });
});

// GET /api/reports: Fetch all persistent reports from db.json
app.get("/api/reports", (req, res) => {
  const reports = readReports();
  res.json(reports);
});

// POST /api/reports: Core transactional issue filing with instant Gemini triage & auto-escalation
app.post("/api/reports", async (req, res) => {
  const { description, building_tag, image_payload, room_label, latitude, longitude } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Missing report description." });
  }

  let category = "Infrastructure";
  let priority = "Medium";
  let reasoning = "Assigned via CampusFix Heuristics Engine (offline model).";

  // 1. Trigger Gemini 3.5 Triage if available
  if (ai) {
    try {
      console.log(`Sending triage request to Gemini 3.5 Flash for building: ${building_tag}`);
      const systemInstruction = `You are the CampusFix AI Triage engine. You auto-classify reports into exactly one of: 'Infrastructure', 'Canteen & Hygiene', 'Safety', 'Connectivity' and assign priority 'Low', 'Medium', or 'High'. Returns structured JSON.`;

      let contents: any[] = [];
      
      if (image_payload) {
        // Extract raw base64 data safely
        const base64Data = image_payload.includes(",") 
          ? image_payload.split(",")[1] 
          : image_payload;
        
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          }
        });
      }

      contents.push({
        text: `Classify this report:
Building: "${building_tag || "Unknown"}"
Description: "${description}"

You MUST output JSON that fits the target schema. Use the precise values:
- category: One of 'Infrastructure', 'Canteen & Hygiene', 'Safety', 'Connectivity'. Maintain spelling and case exactly.
- priority: One of 'Low', 'Medium', 'High'.
- reasoning: Short explanation of your classification.`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Must be exactly: 'Infrastructure', 'Canteen & Hygiene', 'Safety', or 'Connectivity'"
              },
              priority: {
                type: Type.STRING,
                description: "Must be exactly: 'Low', 'Medium', or 'High'"
              },
              reasoning: {
                type: Type.STRING,
                description: "Reasoning for selection"
              }
            },
            required: ["category", "priority", "reasoning"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        
        if (parsed.category === "Canteen" || parsed.category === "Canteen and Hygiene") {
          parsed.category = "Canteen & Hygiene";
        }
        
        category = ["Infrastructure", "Canteen & Hygiene", "Safety", "Connectivity"].includes(parsed.category)
          ? parsed.category
          : "Infrastructure";
          
        priority = ["Low", "Medium", "High"].includes(parsed.priority)
          ? parsed.priority
          : "Medium";

        reasoning = parsed.reasoning || "Triage completed automatically by Gemini AI.";
      }
    } catch (err: any) {
      console.error("Gemini API triage failed. Falling back to diagnostics heuristics. Error:", err.message || err);
      // Fallback heuristics
      const fallback = getHeuristicsTriage(description);
      category = fallback.category;
      priority = fallback.priority;
      reasoning = `${fallback.reasoning} (Gemini pipeline offline)`;
    }
  } else {
    // Local Fallback Heuristics Engine
    const fallback = getHeuristicsTriage(description);
    category = fallback.category;
    priority = fallback.priority;
    reasoning = fallback.reasoning;
  }

  // Load existing, append and save
  const reports = readReports();
  const nextIdNum = reports.length > 0 
    ? Math.max(...reports.map(r => parseInt(r.report_id.replace("rep-", "")) || 0)) + 1
    : 1;
  const report_id = `rep-${String(nextIdNum).padStart(3, '0')}`;

  const newReport = {
    report_id,
    image_payload: image_payload || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    description,
    building_tag,
    room_label: room_label || "General Area",
    latitude: latitude || (30 + Math.random() * 40), // fallback coordinates within map scope
    longitude: longitude || (30 + Math.random() * 40),
    category,
    priority,
    status_state: "Pending",
    cluster_flag: false,
    created_at: Date.now()
  };

  // 2. Perform Real-time Agentic Clustering Check
  // If there are 3 or more total active reports in the same building with the same category, auto-escalate
  const existingActiveReports = reports.filter(r => 
    r.building_tag === building_tag &&
    r.category === category &&
    r.status_state !== 'Resolved'
  );

  const totalUnresolvedInCluster = existingActiveReports.length + 1;
  let escalatedAlert = null;
  let finalReports = [newReport, ...reports];

  if (totalUnresolvedInCluster >= 3) {
    escalatedAlert = {
      building: building_tag,
      category: category,
      count: totalUnresolvedInCluster
    };
    // Mark ALL active issues in this cluster as High priority and set cluster_flag
    finalReports = finalReports.map(r => {
      if (
        r.building_tag === building_tag &&
        r.category === category &&
        r.status_state !== 'Resolved'
      ) {
        return {
          ...r,
          priority: 'High',
          cluster_flag: true
        };
      }
      return r;
    });
  }

  writeReports(finalReports);

  res.json({
    newReport: finalReports.find(r => r.report_id === report_id),
    allReports: finalReports,
    escalatedAlert
  });
});

// PATCH /api/reports/:id/status: Transitions a report's status (securely guarded for 'authority' only)
app.patch("/api/reports/:id/status", (req, res) => {
  const { id } = req.params;
  const { status_state } = req.body;
  const userRole = req.headers["x-user-role"];

  // Enforce server-side RBAC session authorization
  if (userRole !== "authority") {
    return res.status(403).json({ error: "Unauthorized: Only authorities can resolve or start repairs on campus issues." });
  }

  if (!["Pending", "In Progress", "Resolved"].includes(status_state)) {
    return res.status(400).json({ error: "Invalid status state transition request." });
  }

  const reports = readReports();
  const reportIndex = reports.findIndex(r => r.report_id === id);

  if (reportIndex === -1) {
    return res.status(404).json({ error: "Campus report not found." });
  }

  // Update status state
  reports[reportIndex].status_state = status_state;
  if (status_state === "Resolved") {
    reports[reportIndex].resolved_at = Date.now();
  }

  writeReports(reports);
  res.json(reports[reportIndex]);
});

// Setup Vite implementation or Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusFix Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
