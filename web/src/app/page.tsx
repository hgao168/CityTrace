import { readFileSync } from "node:fs";
import path from "node:path";
import Script from "next/script";

function getMvpBody() {
  const source = readFileSync(
    path.join(process.cwd(), "src", "content", "mvp.html"),
    "utf8",
  );
  const body = source.match(/<body[^>]*>([\s\S]*?)<script\s+src="app\.js"><\/script>[\s\S]*?<\/body>/i);

  if (!body) {
    throw new Error("Unable to extract the CityTrace MVP body.");
  }

  return body[1];
}

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: getMvpBody() }} />
      <Script src="/mvp.js" strategy="afterInteractive" />
    </>
  );
}
