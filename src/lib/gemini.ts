import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePathway(goal: string, time: string, level: string = "Beginner", language: string = "Tiếng Việt") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as an educational expert and a supportive study companion. Design a personalized learning roadmap and a weekly timetable for the goal: "${goal}" within the timeframe: "${time}".
    Current learner level: ${level}.
    
    Requirements:
    1. Present as a clear Markdown table with columns: Day/Phase, Topic, Detailed Content, Estimated Time.
    2. Include a "Weekly Timetable" section (e.g., Morning/Afternoon/Evening slots).
    3. Break down the goal into specific daily tasks.
    4. Include references, key terms, or suggested learning methods for each phase.
    5. Add an "AI Companion's Encouragement" section at the end with personalized tips and motivational words for the ${level} level.
    6. Use the following exact headers for sections: "### Learning Roadmap", "### Weekly Timetable", and "### AI Companion's Encouragement".
    7. Output language: ${language}.`,
  });
  return response.text;
}

export async function getSocraticResponse(message: string, history: { role: string; content: string }[], level: string = "Trung bình", language: string = "Tiếng Việt", aiTone: string = "Friendly") {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a master Socratic Tutor. 
      CORE RULES:
      - AUTOMATICALLY IDENTIFY AND USE the exact language and writing style used by the user (Mirroring). 
      - If the user speaks Vietnamese, respond in Vietnamese. If English, use English. If Japanese, use Japanese. If German, use German. If Spanish, use Spanish. If Korean, use Korean.
      - Response Tone: ${aiTone}. Adjust your expression to match this tone (e.g., Friendly, Formal, Encouraging).
      - Mimic the user's tone if they have a special style, but maintain the primary tone of ${aiTone}.
      - NEVER give direct answers.
      - ALWAYS ask guiding questions to lead the student to find the solution themselves.
      - If the student asks for the answer, politely decline and offer a hint or a smaller question.
      - Break down complex problems into small thinking steps.
      - Teaching Level: ${level}.
      - Always end your response with 1 critical question to drive the next step of thinking.
      - Primary target language (if user is ambiguous): ${language}.`,
    },
  });

  // Convert history to Gemini format
  const contents = history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }]
  }));

  const response = await chat.sendMessage({
    message: message,
  });

  return response.text;
}

export async function generateExample(topic: string, level: string = "Intermediate", language: string = "Tiếng Việt") {
  try {
    const prompt = `Provide 5 extremely detailed and in-depth real-world examples about the topic: ${topic}. 
    Learner level: ${level}.
    Each example should include: 
    - Situation: A real story or context.
    - Solution: How to apply knowledge to that situation.
    - Lesson Learned: A brief summary of the rule or knowledge.
    Output language: ${language}. Use beautiful Markdown formatting.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating example:", error);
    return "Could not generate examples at this time.";
  }
}

export async function generateQuizQuestion(topic: string, level: string = "Intermediate", language: string = "Tiếng Việt") {
  try {
    const prompt = `You are an educational expert. Create 1 multiple-choice question about the topic: ${topic} in ${language}.
    Difficulty level: ${level}.
    Response structure must follow this exact format (no extra notes):
    QUESTION: [Question content]
    OPTIONS: A) [Option A], B) [Option B], C) [Option C], D) [Option D]
    ANSWER: [Just the letter of the correct answer A, B, C, or D]
    EXPLAIN: [Detailed explanation of why that answer is correct]`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating quiz question:", error);
    return "Error";
  }
}

export async function generateExercise(topic: string, type: string, language: string = "Tiếng Việt") {
  try {
    const prompt = `Acting as an educational expert, create 3 exercise questions of type ${type} about the topic: ${topic}. 
    Requirements:
    - Include a detailed explanation of why it's correct/incorrect or a solution guide.
    - Suitable for university level.
    - Output language: ${language}. Use beautiful Markdown formatting.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating exercise:", error);
    return "Could not generate exercises at this time.";
  }
}

export async function generateChallenge(topic: string, level: string, language: string = "Tiếng Việt") {
  try {
    const prompt = `
      You are an educational expert. Create 1 exercise about the topic '${topic}' at level '${level}' in ${language}.
      Response structure must follow this exact format (no extra notes):
      QUESTION: [Question content]
      ANSWER: [Brief answer]
      EXPLAIN: [Detailed step-by-step explanation of why that is the answer, including formulas or laws applied]
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating challenge:", error);
    return "Could not generate challenge at this time.";
  }
}

export async function solveProblem(imageBuffer: string, mode: string = "General", language: string = "Tiếng Việt") {
  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBuffer,
    },
  };
  
  let prompt = `Solve the problem in this image. Divide into 3 parts: 1. Problem summary, 2. Detailed solution steps, 3. Core knowledge to remember. Output language: ${language}.`;
  
  if (mode === "Accounting") {
    prompt = `You are a university-level accounting expert. Solve the problem in this image with the highest accuracy.
    Requirements:
    1. Analyze the economic transactions.
    2. Record related journal entries (Debit/Credit) according to current accounting standards.
    3. Detailed explanation of the reason for the entry and the accounting principles applied (e.g., Prudence, Matching principle...).
    4. Present in table format if necessary (e.g., Balance Sheet, Income Statement).
    5. Provide important advice or notes for accounting students about this type of problem.
    Output language: ${language}.`;
  }

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, textPart] },
  });

  return response.text;
}

export async function generateSyncQuestion(content: string, language: string = "Tiếng Việt") {
  try {
    const prompt = `Based on this learning content: "${content}", create 1 short review question.
    Format the response exactly as: QUESTION | ANSWER
    Output language: ${language}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating sync question:", error);
    return null;
  }
}

export async function generateMentorAdvice(data: { xp: number, notesCount: number, historyCount: number, language: string }) {
  try {
    const prompt = `Act as a wise and encouraging AI Mentor. Based on the user's progress:
    - XP: ${data.xp}
    - Saved Notes: ${data.notesCount}
    - Study Sessions: ${data.historyCount}
    
    Provide a short (2-3 sentences), personalized, and highly motivational piece of advice or a "Daily Insight" to help them connect deeper with their learning journey. 
    Use a warm, supportive tone.
    Output language: ${data.language}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating mentor advice:", error);
    return null;
  }
}

export async function generateConversationSummary(history: { role: string, content: string }[], language: string) {
  try {
    const prompt = `Based on the following conversation history, provide a concise summary of the key learning points and any remaining questions or areas for further study.
    History: ${JSON.stringify(history)}
    
    Requirements:
    - Use bullet points.
    - Keep it encouraging.
    - Output language: ${language}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating conversation summary:", error);
    return null;
  }
}

export async function generateSocraticHint(question: string, answer: string, language: string) {
  try {
    const prompt = `The student is stuck on this question: "${question}". The correct answer is "${answer}".
    Provide a subtle, Socratic hint that guides them towards the answer without giving it away.
    Keep it very short (1 sentence).
    Output language: ${language}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating hint:", error);
    return null;
  }
}
