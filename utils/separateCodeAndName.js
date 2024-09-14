const separateCodeAndName = (input) => {
  const regex = /\((\d+)\)\s*(.+)/;
  const match = input ? input.match(regex) : null;

  if (match) {
    const code = match[1];
    const name = match[2];
    return { code, name };
  } else {
    return null;
  }
}
