export { default } from "./App";

export const getLayout = async (name: string): Promise<Layout> =>
  await import(`layouts/${name ?? "default"}`);

export const getPage = async (name: string): Promise<React.ComponentType> =>
  await import(`pages/${name ?? "default"}`);
