import * as vscode from 'vscode';

const CONTEXT_KEY_INSPECTOR_ENABLED = "extension-devtools.treeItemInspector:enabled";

export async function init(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.treeItem.inspect", (...args) => {
        console.log(...args);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.treeItemInspector.enable", () => {
        vscode.commands.executeCommand("setContext", CONTEXT_KEY_INSPECTOR_ENABLED, true);
        vscode.window.showInformationMessage("Tree Item Inspector enabled.");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.treeItemInspector.disable", () => {
        vscode.commands.executeCommand("setContext", CONTEXT_KEY_INSPECTOR_ENABLED, false);
        vscode.window.showInformationMessage("Tree Item Inspector disabled.");
    }));
}