export interface MultichoiceEntry {
  checked: boolean;
  backgroundColor: string;
  textColor: string;
  label: string;
}

export interface MultichoiceConfiguration {
  readonly: boolean;
  items: Array<MultichoiceEntry>;
  label: string;
}

export function initMultichoiceEntry(label: string, checked = false, backgroundColor = 'white', textColor = 'black'): MultichoiceEntry {
  return {
    checked,
    label,
    textColor,
    backgroundColor
  };
}