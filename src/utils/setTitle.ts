import { getConfig } from "@/config";

const setTitle = (title?: string) => {
  const Title = getConfig().Title;
  if (title) {
    document.title = `${title}|${Title}`;
  } else {
    document.title = Title;
  }
};

export default setTitle;
