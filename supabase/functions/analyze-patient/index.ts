import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patient } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    // Create detailed prompt for Gemini
    const prompt = `You are a Healthcare Workflow Orchestrator AI analyzing patient data. 

Patient: ${patient.name}, Age: ${patient.age}
Conditions: ${patient.conditions.join(', ')}
Last Visit: ${patient.lastVisit}

Lab Results:
${Object.entries(patient.labResults).map(([test, result]: [string, any]) => 
  `${test}: ${result.value} (Normal: ${result.normal}) - Status: ${result.status}`
).join('\n')}

Provide a JSON response with:
1. Clinical analysis of the patient's condition
2. Severity level (critical/warning/routine)
3. Confidence score (0-100)
4. Specific automated actions to take

Response format:
{
  "analysis": "Clinical analysis text",
  "severity": "critical|warning|routine",
  "confidence": 85,
  "actions": [
    {
      "type": "notify_doctor",
      "method": "slack_api", 
      "message": "Alert message",
      "priority": "high",
      "estimated_time": "< 1 min"
    }
  ]
}

Focus on patient safety and provide actionable medical workflow recommendations.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response:', data);

    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Try to parse JSON from Gemini response
    let analysisResult;
    try {
      // Extract JSON from response (Gemini sometimes adds extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        analysisResult = {
          analysis: generatedText,
          severity: "routine",
          confidence: 80,
          actions: [
            {
              type: "review_needed",
              method: "manual_review",
              message: "Manual review required",
              priority: "medium",
              estimated_time: "5-10 min"
            }
          ]
        };
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback response
      analysisResult = {
        analysis: generatedText,
        severity: "routine", 
        confidence: 75,
        actions: [
          {
            type: "review_needed",
            method: "manual_review",
            message: "Manual review required",
            priority: "medium",
            estimated_time: "5-10 min"
          }
        ]
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-patient function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: "Unable to analyze patient data at this time.",
      severity: "routine",
      confidence: 0,
      actions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});