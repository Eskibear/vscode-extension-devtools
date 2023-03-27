import * as vscode from "vscode";
import { downloadFile } from "./utils";

const mappingUrl = "https://raw.githubusercontent.com/microsoft/vscode-codicons/main/src/template/mapping.json";
let codicons: string[] = [];
export async function update(context:vscode.ExtensionContext) {
    vscode.window.withProgress({location: vscode.ProgressLocation.Notification}, async (progress, cancel) => {
        progress.report({
            message: "Downloading mapping.json from main branch..."
        });
        const tempFilePath = await downloadFile(mappingUrl);
        progress.report({
            increment: 50
        });
        const src = vscode.Uri.file(tempFilePath);
        const dest = vscode.Uri.file(context.asAbsolutePath("resources/mapping.json"));
        progress.report({message: "Copying mapping.json into extension directory..."});
        await vscode.workspace.fs.copy(src, dest, { overwrite: true });
        progress.report({increment: 30});
        progress.report({message: "Updating mapping..."});
        await init(context);
        progress.report({increment: 20});
    });
}

export async function init(context:vscode.ExtensionContext) {
    const fileUri = vscode.Uri.file(context.asAbsolutePath("resources/mapping.json"));
    const mappingRaw = await vscode.workspace.fs.readFile(fileUri);
    const mapping = JSON.parse(mappingRaw.toString());
    codicons = Object.keys(mapping);
    codiconsProvider.didChangeTreeData.fire();
}
class CodiconsProvider implements vscode.TreeDataProvider<string> {
    public didChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter();
    onDidChangeTreeData?: vscode.Event<string | void | null | undefined> | undefined = this.didChangeTreeData.event;
    getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const item = new vscode.TreeItem(element);
        item.iconPath = new vscode.ThemeIcon(element);
        return item;
    }
    getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
        if (!element) {
            return codicons;
        }
        return undefined;
    }
}

export const codiconsProvider = new CodiconsProvider();