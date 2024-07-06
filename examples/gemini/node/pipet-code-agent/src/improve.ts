import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CODE_LABEL = 'Here is the original code:';
const IMPROVE_LABEL = 'Here is the improved code:';
const PROMPT = `
Improving code involves refactoring it to make it more efficient, readable, and maintainable. 
Examples include simplifying complex logic, removing redundant code, and using more meaningful 
variable names. 
${CODE_LABEL}
for i in x:
    pint(f"Iteration {i} provides this {x**2}.")
${IMPROVE_LABEL}
for i in x:
    print(f"Iteration {i} provides this {x**2}.")
${CODE_LABEL}
height = [1, 2, 3, 4, 5]
w = [6, 7, 8, 9, 10]
${IMPROVE_LABEL}
heights = [1, 2, 3, 4, 5]
weights = [6, 7, 8, 9, 10]
${CODE_LABEL}
while i < 0:
  thrice = i * 3
  thrice = i * 3
  twice = i * 2
${IMPROVE_LABEL}
while i < 0:
  thrice = i * 3
  twice = i * 2
`;

export async function generateImprovedCode() {
  vscode.window.showInformationMessage('Generating improved code...');
  const modelName = vscode.workspace.getConfiguration().get<string>('google.gemini.textModel', 'models/gemini-1.0-pro-latest');

  // Get API Key from local user configuration
  const apiKey = vscode.workspace.getConfiguration().get<string>('google.gemini.apiKey');
  if (!apiKey) {
    vscode.window.showErrorMessage('API key not configured. Check your settings.');
    return;
  }

  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({model: modelName});

  // Text selection
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.debug('Abandon: no open text editor.');
    return;
  }

  const selection = editor.selection;
  const selectedCode = editor.document.getText(selection);

  // Build the full prompt using the template.
  const fullPrompt = `${PROMPT}
    ${CODE_LABEL}
    ${selectedCode}
    ${IMPROVE_LABEL}
    `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const improvedCode = response.text();  

  // Replace selection with improved code
  editor.edit((editBuilder) => {
    editBuilder.replace(selection, improvedCode);
  });
}
