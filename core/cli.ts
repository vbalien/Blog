import { cac } from "cac";
import readline from "readline";
import util from "util";
import path from "path";
import { promises as fsPromises } from "fs";
import { runBuild } from "./builder";

const cli = cac();

cli.command("new <template>", "create new page").action(async templateName => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = util.promisify(rl.question).bind(rl);
  const template: Template = (await import(`templates/${templateName}`))
    .default;
  const title = await question("Title: ");
  const slug = await question("Slug: ");
  const tags: string[] = (await question("Tags(comma-separated): "))
    .split(",")
    .map((t: string) => t.trim());
  rl.close();

  const result = template({ title, date: new Date(), tags, slug });
  const savePath = path.join(result.path, result.filename);
  const handle = await fsPromises.open(savePath, "w");
  await handle.writeFile(result.content, {});
  await handle.close();
  console.info("Created new page -> " + savePath);
});

cli.command("build", "build static pages").action(async () => {
  await runBuild();
});

cli.help();

try {
  cli.parse();
} catch (err) {
  console.error(err.message);
}
