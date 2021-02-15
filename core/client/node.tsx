export { default } from "./App";

export const getLayout = async (name: string): Promise<Layout> =>
  await import(`layouts/${name ?? "default"}`);
