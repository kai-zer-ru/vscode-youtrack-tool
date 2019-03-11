"use strict";
import * as vscode from "vscode";

import {
  TestConnectionCommand,
  TaskListCommand,
  TaskStartIssueCommand,
  TaskStopIssueCommand,
  TaskOpenIssueInBrowserCommand,
  TaskUpdatePanelCommand
} from "./commands";

import { TDPanelProvider } from "./td-provider";

function activate(_context) {
  const context = _context;
  const workspaceState = context.workspaceState;
  const channel = vscode.window.createOutputChannel("youtrack");
  context.subscriptions.push(channel);

  const config = vscode.workspace.getConfiguration("youtrack");

  // plugin panel
  const panel = vscode.workspace.registerTextDocumentContentProvider(
    "css-preview",
    new TDPanelProvider()
  );
  context.subscriptions.push(panel);

  // statusbar button
  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    250
  );
  status.command = "youtrack.list";
  status.text = "YouTrack List";
  status.show();
  context.subscriptions.push(status);

  const commands = [
    new TestConnectionCommand(status, panel),
    new TaskListCommand(status, panel),
    new TaskStartIssueCommand(status, panel),
    new TaskStopIssueCommand(status, panel),
    new TaskOpenIssueInBrowserCommand(status, panel),
    new TaskUpdatePanelCommand(status, panel)
  ];

  context.subscriptions.push(
    ...commands.map(command =>
      vscode.commands.registerCommand(command.id, command.run)
    )
  );
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
