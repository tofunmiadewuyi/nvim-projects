import { Action as RaycastAction, ActionPanel as RaycastActionPanel, Form as RaycastForm, List as RaycastList, LocalStorage, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";

const STORAGE_KEY = "projectDirs";

const List = RaycastList as unknown as any;
const ActionPanel = RaycastActionPanel as unknown as any;
const Action = RaycastAction as unknown as any;
const Form = RaycastForm as unknown as any;

export default function Command() {
  const [dirs, setDirs] = useState<string[]>([]);
  const { push } = useNavigation();

  useEffect(() => {
    LocalStorage.getItem<string>(STORAGE_KEY).then((stored) => {
      if (stored) setDirs(JSON.parse(stored));
    });
  }, []);

  async function removeDir(dir: string) {
    const updated = dirs.filter((d) => d !== dir);
    await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDirs(updated);
    showToast({ style: Toast.Style.Success, title: "Removed" });
  }

  async function addDir(path: string) {
    if (dirs.includes(path)) return;
    const updated = [...dirs, path];
    await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDirs(updated);
    showToast({ style: Toast.Style.Success, title: "Added" });
  }

  return (
    <List
      searchBarPlaceholder="Manage project directories..."
      actions={
        <ActionPanel>
          <Action title="Add Directory" onAction={() => push(<AddDirForm onAdd={addDir} />)} />
        </ActionPanel>
      }
    >
      {dirs.map((dir) => (
        <List.Item
          key={dir}
          title={dir}
          actions={
            <ActionPanel>
              <Action title="Add Directory" onAction={() => push(<AddDirForm onAdd={addDir} />)} />
              <Action title="Remove" style={Action.Style.Destructive} onAction={() => removeDir(dir)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function AddDirForm({ onAdd }: { onAdd: (path: string) => void }): JSX.Element {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Add"
            onSubmit={(values: any) => {
              const files = values.path as string[];
              if (files.length > 0) onAdd(files[0]);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="path"
        title="Directory"
        allowMultipleSelection={false}
        canChooseDirectories={true}
        canChooseFiles={false}
      />
    </Form>
  ) ;
}
