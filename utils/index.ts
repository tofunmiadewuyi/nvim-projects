import { execSync } from "child_process";

export function attachTmux(terminal: string, tmuxPath: string, sessionName: string) {
  const isRunning = isAppRunning(terminal);
  const isAttached = isSessionAttached(tmuxPath, sessionName);

  if (isRunning && isAttached) {
    // Just focus the terminal
    execSync(`osascript -e 'tell application "${terminal}" to activate'`);
    return;
  }

  if (terminal === "iTerm") {
    execSync(`osascript -e '
      tell application "iTerm"
        activate
        create window with default profile command "${tmuxPath} -u attach -t ${sessionName}"
      end tell
    '`);
  } else {
    // Generic keystroke approach for everything else
    execSync(`osascript -e '
      tell application "${terminal}" to activate
      tell application "System Events"
        repeat until (exists window 1 of process "${terminal}")
          delay 0.1
        end repeat
        keystroke "${tmuxPath} -u attach -t ${sessionName}"
        delay 0.1
        key code 36
      end tell
    '`);
  }
}

function isAppRunning(appName: string): boolean {
  try {
    execSync(`pgrep -q "${appName}"`);
    return true;
  } catch {
    return false;
  }
}

function isSessionAttached(tmuxPath: string, sessionName: string): boolean {
  try {
    const output = execSync(`${tmuxPath} list-clients -t ${sessionName} `).toString();
    return output.trim().length > 0;
  } catch {
    return false;
  }
}
