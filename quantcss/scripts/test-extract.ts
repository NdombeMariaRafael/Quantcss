import fs from "fs";
import { extractClasses } from "../src/detector/extract";

const html = fs.readFileSync("src/index.html", "utf8");
const classes = extractClasses(html);

console.log("CLASSES EXTRAÍDAS:", classes);
