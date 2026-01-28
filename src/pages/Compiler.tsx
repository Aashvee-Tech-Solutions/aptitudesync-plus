import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodeEditor from "@/components/CodeEditor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Code, FlaskConical, BookOpen } from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

const SAMPLE_PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", description: "Basic case" },
      { input: "3 2 4\n6", expectedOutput: "1 2", description: "Middle elements" },
      { input: "3 3\n6", expectedOutput: "0 1", description: "Same elements" },
    ],
    starterCode: {
      python: `def two_sum(nums, target):
    # Your code here
    pass

# Read input
nums = list(map(int, input().split()))
target = int(input())
result = two_sum(nums, target)
print(result[0], result[1])`,
      javascript: `function twoSum(nums, target) {
    // Your code here
}

// Read input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
  lines.push(line);
  if (lines.length === 2) {
    const nums = lines[0].split(' ').map(Number);
    const target = parseInt(lines[1]);
    const result = twoSum(nums, target);
    console.log(result[0], result[1]);
    rl.close();
  }
});`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    string line;
    getline(cin, line);
    
    vector<int> nums;
    istringstream iss(line);
    int n;
    while (iss >> n) nums.push_back(n);
    
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
    },
  },
  {
    id: "palindrome",
    title: "Palindrome Check",
    difficulty: "Easy",
    description: "Check if a given string is a palindrome. A palindrome is a word that reads the same backward as forward.",
    examples: [
      { input: "racecar", output: "true" },
      { input: "hello", output: "false" },
    ],
    testCases: [
      { input: "racecar", expectedOutput: "true", description: "Valid palindrome" },
      { input: "hello", expectedOutput: "false", description: "Not a palindrome" },
      { input: "a", expectedOutput: "true", description: "Single character" },
      { input: "madam", expectedOutput: "true", description: "Odd length palindrome" },
    ],
    starterCode: {
      python: `def is_palindrome(s):
    # Your code here
    pass

s = input().strip()
print("true" if is_palindrome(s) else "false")`,
      javascript: `function isPalindrome(s) {
    // Your code here
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  console.log(isPalindrome(line.trim()) ? "true" : "false");
  rl.close();
});`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Your code here
    return false;
}

int main() {
    string s;
    getline(cin, s);
    cout << (isPalindrome(s) ? "true" : "false") << endl;
    return 0;
}`,
    },
  },
  {
    id: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "Easy",
    description: "Given n, calculate the nth Fibonacci number. The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, ...",
    examples: [
      { input: "5", output: "5" },
      { input: "10", output: "55" },
    ],
    testCases: [
      { input: "0", expectedOutput: "0", description: "Base case F(0)" },
      { input: "1", expectedOutput: "1", description: "Base case F(1)" },
      { input: "5", expectedOutput: "5", description: "F(5)" },
      { input: "10", expectedOutput: "55", description: "F(10)" },
    ],
    starterCode: {
      python: `def fibonacci(n):
    # Your code here
    pass

n = int(input())
print(fibonacci(n))`,
      javascript: `function fibonacci(n) {
    // Your code here
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  console.log(fibonacci(parseInt(line)));
  rl.close();
});`,
      cpp: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    // Your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << fibonacci(n) << endl;
    return 0;
}`,
    },
  },
];

const Compiler = () => {
  const [activeTab, setActiveTab] = useState("playground");
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([]);
  const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  const addTestCase = () => {
    setCustomTestCases([...customTestCases, { input: "", expectedOutput: "", description: "" }]);
  };

  const removeTestCase = (index: number) => {
    setCustomTestCases(customTestCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...customTestCases];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTestCases(updated);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-24 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Code Compiler
          </h1>
          <p className="text-muted-foreground">
            Write, run, and test code in 9 programming languages
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="playground" className="gap-2">
              <Code className="w-4 h-4" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="problems" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Problems
            </TabsTrigger>
          </TabsList>

          {/* Playground Tab */}
          <TabsContent value="playground" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Code Editor */}
              <div className="lg:col-span-2">
                <CodeEditor testCases={customTestCases} />
              </div>

              {/* Test Cases Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-primary" />
                        <CardTitle className="text-base">Custom Test Cases</CardTitle>
                      </div>
                      <Button size="sm" onClick={addTestCase}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <CardDescription>
                      Add input/output pairs to test your code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customTestCases.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No test cases yet. Click "Add" to create one.
                      </div>
                    ) : (
                      customTestCases.map((tc, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Test {index + 1}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestCase(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Description (optional)"
                            value={tc.description || ""}
                            onChange={(e) => updateTestCase(index, "description", e.target.value)}
                          />
                          <Textarea
                            placeholder="Input"
                            value={tc.input}
                            onChange={(e) => updateTestCase(index, "input", e.target.value)}
                            className="font-mono text-sm"
                            rows={2}
                          />
                          <Textarea
                            placeholder="Expected Output"
                            value={tc.expectedOutput}
                            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                            className="font-mono text-sm"
                            rows={2}
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Problems Tab */}
          <TabsContent value="problems" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Problem List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Practice Problems</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {SAMPLE_PROBLEMS.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedProblem.id === problem.id
                          ? "bg-primary/10 border-primary border"
                          : "bg-muted hover:bg-muted/80 border border-transparent"
                      }`}
                    >
                      <div className="font-semibold text-sm">{problem.title}</div>
                      <Badge
                        variant={problem.difficulty === "Easy" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {problem.difficulty}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Problem Details & Editor */}
              <div className="lg:col-span-3 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedProblem.title}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {selectedProblem.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{selectedProblem.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Examples:</h4>
                      {selectedProblem.examples.map((ex, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg font-mono text-sm">
                          <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                          <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <CodeEditor
                  initialCode={selectedProblem.starterCode[selectedLanguage as keyof typeof selectedProblem.starterCode] || selectedProblem.starterCode.python}
                  initialLanguage={selectedLanguage}
                  testCases={selectedProblem.testCases}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Compiler;