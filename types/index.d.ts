type Effect = "light" | "dark";

type Recordable<T = any> = Record<string, T>

interface ImportMetaEnv extends ViteEnv {
  __: unknown;
}