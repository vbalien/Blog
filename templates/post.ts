function dateFormat(date: Date) {
  // YYYY-MM-DD
  return `${date.getFullYear().toString()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

const template: Template = ({ date, slug, tags, title }) => ({
  path: "pages/archives/",
  filename: `${dateFormat(date)}-${slug}.mdx`,
  content: `export const metadata = {
  title: ${JSON.stringify(title)},
  date: ${JSON.stringify(dateFormat(date))},
  tags: ${JSON.stringify(tags)}
}

`,
});
export default template;
