import * as vscode from 'vscode';
import { init as initCommands, commandHistoryProvider, runCommand, openConfigFile, Execution } from './commands';

export function activate(context: vscode.ExtensionContext) {
	
	initCommands(context);
	context.subscriptions.push(vscode.commands.registerCommand('extension-devtools.openConfigFile', openConfigFile));
	context.subscriptions.push(vscode.commands.registerCommand('extension-devtools.executeCommand', async (item?: Execution) => {
		if (item) {
			const {command, args} = item;
			args ? runCommand(command, ...args) : runCommand(command);
		} else {
			const command = await vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: "<command-id>"
			});
			if (!command) { return; }

			const argsRaw = await vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: `An array of args in JSON format, e.g. ["arg1", "arg2"]`
			});
			if (argsRaw === undefined) { return; }

			const args = argsRaw ? await JSON.parse(argsRaw) : [];
			runCommand(command, ...args);
		}
	}));

	context.subscriptions.push(vscode.window.registerTreeDataProvider("extension-devtools.view.commands", commandHistoryProvider));
}


export function deactivate() {}
