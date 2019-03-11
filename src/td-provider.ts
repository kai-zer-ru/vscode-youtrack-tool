"use strict";
import * as vscode from "vscode";
import * as store from "./store";
import { YouTrackIssue } from "./issue";

const pug = require("pug");

export class TDPanelProvider {
  private theme: object;
  private issueItemClass = YouTrackIssue;

  constructor() {
    this.theme = {};
    // console.log("theme", this.theme);
  }

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }

  public update(uri: vscode.Uri) {
    this._onDidChange.fire(uri);
  }

  public provideTextDocumentContent(uri, token) {
    const compiledFunction = pug.compileFile(__dirname + "/../index.pug");
    const issues = store.get("issues").map(item => {
      return new YouTrackIssue(item.$.id, item);
    });
    const theme = this.theme;

    return compiledFunction({
      count: issues.length,
      issues,
      theme
    });
  }
}
