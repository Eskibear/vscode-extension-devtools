import { get } from "http";
import * as vscode from "vscode";
import { downloadFile } from "./utils";

const mappingUrl = "https://raw.githubusercontent.com/microsoft/vscode-codicons/main/src/template/mapping.json";
let codicons: string[] = [];
export async function init(context:vscode.ExtensionContext) {
    const mappingRaw = await downloadFile(mappingUrl, true);
    const mapping = JSON.parse(mappingRaw);
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