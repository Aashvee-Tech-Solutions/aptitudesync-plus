import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Play, CheckCircle2, XCircle, Loader2, Code, Terminal, FlaskConical, Copy, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍" },
  { id: "javascript", name: "JavaScript", icon: "📜" },
  { id: "java", name: "Java", icon: "☕" },
  { id: "cpp", name: "C++", icon: "⚡" },
  { id: "c", name: "C", icon: "🔧" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "rust", name: "Rust", icon: "🦀" },
  { id: "ruby", name: "Ruby", icon: "💎" },
  { id: "php", name: "PHP", icon: "🐘" },
];

const STARTER_CODE: Record<string, string> = {
  python: `# Python Code
def main():
    n = int(input())
    print(f"Hello, you entered: {n}")

if __name__ == "__main__":
    main()`,
  javascript: `// JavaScript Code
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('', (answer) => {
  console.log(\`Hello, you entered: \${answer}\`);
  rl.close();
});`,
  java: `// Java Code
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println("Hello, you entered: " + n);
    }
}`,
  cpp: `// C++ Code
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "Hello, you entered: " << n << endl;
    return 0;
}`,
  c: `// C Code
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("Hello, you entered: %d\\n", n);
    return 0;
}`,
  go: `// Go Code
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    var n int
    fmt.Fscan(reader, &n)
    fmt.Printf("Hello, you entered: %d\\n", n)
}`,
  rust: `// Rust Code
use std::io;

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let n: i32 = input.trim().parse().unwrap();
    println!("Hello, you entered: {}", n);
}`,
  ruby: `# Ruby Code
n = gets.chomp.to_i
puts "Hello, you entered: #{n}"`,
  php: `<?php
// PHP Code
$n = intval(fgets(STDIN));
echo "Hello, you entered: $n\\n";
?>`,
};

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
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

interface ExecutionResult {
  type: "execution_result" | "test_results";
  output?: string;
  error?: string;
  executionTime?: number;
  language?: string;
  results?: TestResult[];
  summary?: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  testCases?: TestCase[];
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  onResults?: (results: ExecutionResult) => void;
}

const CodeEditor = ({
  initialCode,
  initialLanguage = "python",
  testCases = [],
  readOnly = false,
  onCodeChange,
  onLanguageChange,
  onResults,
}: CodeEditorProps) => {
  const { toast } = useToast();
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || STARTER_CODE[initialLanguage]);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("output");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{ total: number; passed: number; failed: number; passRate: number } | null>(null);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    if (!initialCode) {
      setCode(STARTER_CODE[newLanguage] || "");
    }
    onLanguageChange?.(newLanguage);
  }, [initialCode, onLanguageChange]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  const handleReset = useCallback(() => {
    setCode(initialCode || STARTER_CODE[language]);
    setOutput("");
    setTestResults([]);
    setSummary(null);
  }, [initialCode, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
  }, [code, toast]);

  const runCode = async (runTests: boolean = false) => {
    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    setSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke("execute-code", {
        body: {
          code,
          language,
          stdin: runTests ? undefined : stdin,
          testCases: runTests ? testCases : undefined,
        },
      });

      if (error) throw error;

      const result = data as ExecutionResult;

      if (result.type === "test_results" && result.results) {
        setTestResults(result.results);
        setSummary(result.summary || null);
        setActiveTab("tests");
      } else {
        setOutput(result.output || result.error || "No output");
        setActiveTab("output");
      }

      onResults?.(result);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
      setActiveTab("output");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  <span className="flex items-center gap-2">
                    <span>{lang.icon}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => runCode(false)} disabled={isRunning}>
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Code
          </Button>
          {testCases.length > 0 && (
            <Button variant="hero" onClick={() => runCode(true)} disabled={isRunning}>
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FlaskConical className="w-4 h-4 mr-2" />
              )}
              Run Tests
            </Button>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <Card className="flex-1">
        <CardHeader className="py-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Code Editor</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Write your code here..."
            className="font-mono text-sm min-h-[300px] resize-none border-0 rounded-none focus-visible:ring-0"
            readOnly={readOnly}
            spellCheck={false}
          />
        </CardContent>
      </Card>

      {/* Input/Output Panel */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="py-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input" className="gap-2">
                <Terminal className="w-4 h-4" />
                Input
              </TabsTrigger>
              <TabsTrigger value="output" className="gap-2">
                <Terminal className="w-4 h-4" />
                Output
              </TabsTrigger>
              <TabsTrigger value="tests" className="gap-2">
                <FlaskConical className="w-4 h-4" />
                Tests {testCases.length > 0 && <Badge variant="secondary">{testCases.length}</Badge>}
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="input" className="m-0">
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input for your program (stdin)..."
                className="font-mono text-sm min-h-[120px] resize-none"
              />
            </TabsContent>
            <TabsContent value="output" className="m-0">
              <div className="p-4 bg-muted rounded-lg min-h-[120px] font-mono text-sm whitespace-pre-wrap">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </div>
                ) : output ? (
                  output
                ) : (
                  <span className="text-muted-foreground">Run your code to see output</span>
                )}
              </div>
            </TabsContent>
            <TabsContent value="tests" className="m-0">
              {summary && (
                <div className="flex items-center gap-4 p-4 mb-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {summary.passRate === 100 ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                    <span className="font-semibold">
                      {summary.passed}/{summary.total} Tests Passed
                    </span>
                  </div>
                  <Badge variant={summary.passRate === 100 ? "default" : "destructive"}>
                    {summary.passRate}%
                  </Badge>
                </div>
              )}
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {testResults.length > 0 ? (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.passed
                          ? "bg-success/10 border-success/20"
                          : "bg-destructive/10 border-destructive/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          Test {index + 1}
                          {result.description && (
                            <span className="font-normal text-muted-foreground">
                              - {result.description}
                            </span>
                          )}
                        </span>
                        {result.executionTime && (
                          <Badge variant="outline">{result.executionTime}ms</Badge>
                        )}
                      </div>
                      <div className="grid gap-2 text-sm font-mono">
                        <div>
                          <span className="text-muted-foreground">Input: </span>
                          <span className="text-foreground">{result.input || "(empty)"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected: </span>
                          <span className="text-foreground">{result.expectedOutput}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual: </span>
                          <span className={result.passed ? "text-success" : "text-destructive"}>
                            {result.actualOutput || result.error || "(empty)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : testCases.length > 0 ? (
                  <div className="text-muted-foreground text-center py-6">
                    Click "Run Tests" to execute all test cases
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-6">
                    No test cases configured
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CodeEditor;