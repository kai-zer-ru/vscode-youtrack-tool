"use strict";
import * as vscode from "vscode";

export interface Configuration {
  serverUrl: string;
  userName: string;
  userPassword: string;
  searchQuery: string;

  priorityField: string;
  stateField: string;
  assigneeField: string;
}

export function getConfiguration(): Configuration {
  const config = vscode.workspace
    .getConfiguration()
    .get<Configuration>("youtrack");

  if (!config) {
    throw new Error("No configuration found. Probably an error in vscode");
  }
  return config;
}
