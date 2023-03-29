export const makeCombinedStoreName = ({
  name,
  code,
}: {
  name: string;
  code: string;
}) => `${name.trim()} #${code.trim()}`;
