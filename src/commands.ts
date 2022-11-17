import * as vscode from 'vscode';

export interface Execution {
    command: string;
    args?: any[];
}

let history: Execution[] = [];
const FILENAME = "devtools.json";
let storageUri: vscode.Uri;

export async function init(context: vscode.ExtensionContext) {
    storageUri = context.storageUri ?? context.extensionUri;
    const configFile = vscode.Uri.joinPath(storageUri, FILENAME);
    initHistoryFromFile(configFile);
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(storageUri, FILENAME));
    watcher.onDidChange(uri => {
        initHistoryFromFile(configFile);
    });
}

async function initHistoryFromFile(configFile: vscode.Uri) {
    try {
        const content = await vscode.workspace.fs.readFile(configFile);
        const config = JSON.parse(content.toString());
        if (config.execution) {
            history = [...config.execution];
        }
    } catch (error) {}
    eventEmitter.fire(undefined);
}

export function setHistory(values: Execution[]) {
    history.push(...values);
}

// explorer
const eventEmitter = new vscode.EventEmitter<Execution | undefined>();
export const commandHistoryProvider: vscode.TreeDataProvider<Execution> = {
    onDidChangeTreeData: eventEmitter.event,
    getTreeItem: function (element: Execution): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const item = new vscode.TreeItem(element.command);
        item.description = element.args && JSON.stringify(element.args);
        return item;
    },
    getChildren: function (element?: Execution): vscode.ProviderResult<Execution[]> {
        if (!element) {
            return history;
        }
    }
};

export function getHistory() {
    return history;
}

export async function runCommand(command: string, ...args: any) {
	console.log("runCommand:", {command, args});
    updateHistory(command, args);
	const result = await vscode.commands.executeCommand(command, ...args);
    console.log("result:", result);
};

function updateHistory(command: string, args: any) {
    const lastRun = history.find((e) => e?.command === command && JSON.stringify(e?.args) === JSON.stringify(args));
    if (!lastRun) {
        history.push({
            command,
            args
        });
    }
    eventEmitter.fire(undefined);
    saveHistoryToFile();
}

export function removeExecution(e: Execution) {
    const index = history.indexOf(e);
    if (index >= 0) {
        delete history[index];
    }
    history = history.filter(Boolean);
    eventEmitter.fire(undefined);
    saveHistoryToFile();
}

async function saveHistoryToFile() {
    try {
        const configFile = vscode.Uri.joinPath(storageUri, FILENAME);
        await vscode.workspace.fs.writeFile(configFile, Buffer.from(JSON.stringify({
            execution: history
        }, null, 2)));
    } catch (error) {}
}


export function openConfigFile() {
    const configFile = vscode.Uri.joinPath(storageUri, FILENAME);
    vscode.commands.executeCommand("vscode.open", configFile);
}