/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** tmux Path - Full path to tmux binary */
  "tmuxPath": string,
  /** Terminal - Terminal app to use */
  "terminal": "Ghostty" | "iTerm" | "Terminal" | "kitty" | "Alacritty" | "Warp"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `index` command */
  export type Index = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-dirs` command */
  export type ManageDirs = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `index` command */
  export type Index = {}
  /** Arguments passed to the `manage-dirs` command */
  export type ManageDirs = {}
}

