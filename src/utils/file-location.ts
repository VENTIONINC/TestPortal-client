export interface ParsedFileLocation {
  filePath: string;
  line: number;
  column?: number;
}

export const parseFileLocation = (locationText: string): ParsedFileLocation | null => {
  // Match patterns like:
  // "at /path/to/file.ts:46:77" or "/path/to/file.ts:46:77"
  // "(/path/to/file.ts:46:77)" - parentheses format
  const locationMatch = locationText.match(/(?:at\s+)?(?:\()?([^:\s()]+):(\d+)(?::(\d+))?(?:\))?/);
  
  if (!locationMatch) {
    return null;
  }

  const [, filePath, lineStr, columnStr] = locationMatch;
  const line = parseInt(lineStr, 10);
  const column = columnStr ? parseInt(columnStr, 10) : undefined;

  return {
    filePath,
    line,
    column
  };
};

export const openInVSCode = (filePath: string, line?: number, column?: number): void => {
  let url = `vscode://file${filePath}`;
  
  if (line !== undefined) {
    url += `:${line}`;
    if (column !== undefined) {
      url += `:${column}`;
    }
  }
  
  window.open(url, '_self');
};