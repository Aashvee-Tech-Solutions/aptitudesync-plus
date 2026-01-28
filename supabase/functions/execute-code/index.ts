import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Language configurations for Judge0 API
const languageConfigs: Record<string, { id: number; name: string; extension: string }> = {
  python: { id: 71, name: "Python (3.8.1)", extension: "py" },
  javascript: { id: 63, name: "JavaScript (Node.js 12.14.0)", extension: "js" },
  java: { id: 62, name: "Java (OpenJDK 13.0.1)", extension: "java" },
  cpp: { id: 54, name: "C++ (GCC 9.2.0)", extension: "cpp" },
  c: { id: 50, name: "C (GCC 9.2.0)", extension: "c" },
  go: { id: 60, name: "Go (1.13.5)", extension: "go" },
  rust: { id: 73, name: "Rust (1.40.0)", extension: "rs" },
  ruby: { id: 72, name: "Ruby (2.7.0)", extension: "rb" },
  php: { id: 68, name: "PHP (7.4.1)", extension: "php" },
};

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface ExecuteRequest {
  code: string;
  language: string;
  testCases?: TestCase[];
  stdin?: string;
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  description?: string;
  error?: string;
  executionTime?: number;
}

async function executeCode(
  code: string,
  language: string,
  stdin: string = ""
): Promise<{ output: string; error?: string; executionTime?: number }> {
  const config = languageConfigs[language];
  if (!config) {
    return { output: "", error: `Unsupported language: ${language}` };
  }

  // Use AI to simulate code execution for safety
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    return { output: "", error: "Server configuration error" };
  }

  try {
    const startTime = Date.now();
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a code execution simulator. Execute the given ${config.name} code with the provided input and return ONLY the exact output that the program would produce. Do not include any explanations, comments, or formatting - just the raw output as it would appear in a terminal. If there's an error, start your response with "ERROR:" followed by the error message.`,
          },
          {
            role: "user",
            content: `Execute this ${config.name} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nStandard Input:\n${stdin || "(no input)"}\n\nProvide ONLY the exact output:`,
          },
        ],
        max_tokens: 2000,
        temperature: 0,
      }),
    });

    const data = await response.json();
    const executionTime = Date.now() - startTime;
    
    if (data.error) {
      return { output: "", error: data.error.message || "Execution failed", executionTime };
    }

    const output = data.choices?.[0]?.message?.content?.trim() || "";
    
    if (output.startsWith("ERROR:")) {
      return { output: "", error: output.substring(6).trim(), executionTime };
    }

    return { output, executionTime };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { output: "", error: `Execution error: ${errorMessage}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, testCases, stdin }: ExecuteRequest = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Code and language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedLanguage = language.toLowerCase();
    if (!languageConfigs[normalizedLanguage]) {
      return new Response(
        JSON.stringify({ 
          error: `Unsupported language: ${language}. Supported: ${Object.keys(languageConfigs).join(", ")}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If test cases are provided, run against all test cases
    if (testCases && testCases.length > 0) {
      const results: TestResult[] = [];
      let passedCount = 0;

      for (const testCase of testCases) {
        const { output, error, executionTime } = await executeCode(code, normalizedLanguage, testCase.input);
        
        const actualOutput = output.trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = !error && actualOutput === expectedOutput;
        
        if (passed) passedCount++;

        results.push({
          passed,
          input: testCase.input,
          expectedOutput,
          actualOutput,
          description: testCase.description,
          error,
          executionTime,
        });
      }

      return new Response(
        JSON.stringify({
          type: "test_results",
          results,
          summary: {
            total: testCases.length,
            passed: passedCount,
            failed: testCases.length - passedCount,
            passRate: Math.round((passedCount / testCases.length) * 100),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single execution mode
    const { output, error, executionTime } = await executeCode(code, normalizedLanguage, stdin);

    return new Response(
      JSON.stringify({
        type: "execution_result",
        output,
        error,
        executionTime,
        language: languageConfigs[normalizedLanguage].name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: `Server error: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});