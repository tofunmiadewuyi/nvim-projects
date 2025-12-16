// src/index.tsx
import {
  ActionPanel as RaycastActionPanel,
  Action as RaycastAction,
  List as RaycastList,
  showToast,
  Toast,
  getPreferenceValues,
  closeMainWindow,
  LocalStorage,
  popToRoot,
} from "@raycast/api";
import { readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import { homedir } from "os";
import { join } from "path";
import { useEffect, useState } from "react";
import { attachTmux } from "../utils";

const List = RaycastList as unknown as any;
const ActionPanel = RaycastActionPanel as unknown as any;
const Action = RaycastAction as unknown as any;

const SESSION_NAME = "dev";
const STORAGE_KEY = "projectDirs";
const DEFAULT_DIRS = ["Desktop/vue", "Desktop/node", "Desktop/go", "Desktop/laravel"];

interface Preferences {
  tmuxPath: string;
  terminal: string;
}

function getProjects(projectDirs: string[]): { name: string; path: string; category: string }[] {
  const projects: { name: string; path: string; category: string }[] = [];

  for (const dir of projectDirs) {
    // dir is now an absolute path from FilePicker
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const entryPath = join(dir, entry);
        if (statSync(entryPath).isDirectory()) {
          projects.push({
            name: entry,
            path: entryPath,
            category: dir.split("/").pop() || "",
          });
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

async function openProject(projectPath: string) {
  const { tmuxPath, terminal } = getPreferenceValues<Preferences>();
  const windowName = projectPath.split("/").pop() || "project";

  try {
    // Kill existing terminal (detaches, keeps session)
    // try {
    //   execSync(`pkill -x "${terminal}"`);
    // } catch {
    //   // ignore if not running
    // }

    execSync("sleep 0.2");

    // Check if session exists
    let sessionExists = false;
    try {
      execSync(`${tmuxPath} has-session -t ${SESSION_NAME} 2>/dev/null`);
      sessionExists = true;
    } catch {
      // ignore if no session
    }

    if (sessionExists) {
      // Check if window for this project exists
      try {
        execSync(`${tmuxPath} select-window -t ${SESSION_NAME}:${windowName} 2>/dev/null`);
        // Window exists, just select it
      } catch {
        // Create new window for this project
        execSync(`${tmuxPath} new-window -t ${SESSION_NAME} -n ${windowName} -c "${projectPath}" "nvim"`);
      }
    } else {
      // Create session with this project
      execSync(`${tmuxPath} new-session -d -s ${SESSION_NAME} -n ${windowName} -c "${projectPath}" "nvim"`);
    }

    // popToRoot()
    await closeMainWindow();
    attachTmux(terminal, tmuxPath, SESSION_NAME);
    showToast({ style: Toast.Style.Success, title: "Opened project" });
  } catch (error) {
    showToast({ style: Toast.Style.Failure, title: "Failed to open project", message: String(error) });
  }
}

export default function Command() {
  const home = homedir();
  const [projects, setProjects] = useState<{ name: string; path: string; category: string }[]>([]);

  useEffect(() => {
    LocalStorage.getItem<string>(STORAGE_KEY).then((stored) => {
      const dirs = stored ? JSON.parse(stored) : DEFAULT_DIRS.map((d) => join(home, d));
      setProjects(getProjects(dirs));
    });
  }, []);

  return (
    <List searchBarPlaceholder="Search projects...">
      {projects.map((project) => (
        <List.Item
          key={project.path}
          title={project.name}
          subtitle={project.category}
          actions={
            <ActionPanel>
              <Action title="Open in Neovim" onAction={() => openProject(project.path)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
