import { HtmlBasePlugin } from "@11ty/eleventy";


export default function (config) {
  config.addPlugin(HtmlBasePlugin);
  config.addPassthroughCopy({ "src/assets": "assets" });

  // 글 목록: 최신 글이 위로
  config.addCollection("writing", (api) =>
    api.getFilteredByGlob("src/writing/*.md").sort((a, b) => b.date - a.date)
  );

  config.addFilter("byCategory", (items, key) => items.filter((i) => i.data.category === key));

  config.addFilter("year", (d) => (d === "now" ? new Date() : new Date(d)).getUTCFullYear());

  // 2026-09-12 → 2026.9.12.
  config.addFilter("dot", (d) => {
    const x = new Date(d);
    return `${x.getUTCFullYear()}.${x.getUTCMonth() + 1}.${x.getUTCDate()}.`;
  });

  config.addFilter("subline", (data) => [data.work, data.source].filter(Boolean).join(" · "));

  config.addFilter("iso", (d) => new Date(d).toISOString().slice(0, 10));

  const CAT = { criticism: "비평", programme: "프로그램 글", academic: "논문" };
  config.addFilter("catLabel", (k) => CAT[k] || "글");

  config.addFilter("nl2br", (s) =>
    String(s).trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")
  );

  // 본문 첫 문장을 목록에 보여 준다
  config.addFilter("firstSentence", (html) => {
    const text = String(html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const m = text.match(/^.+?[다요까]\.(?=\s|$)|^.+?[.?!](?=\s|$)/);
    return m ? m[0] : text.slice(0, 80);
  });

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}

