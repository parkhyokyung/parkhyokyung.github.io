import { HtmlBasePlugin } from "@11ty/eleventy";


export default function (config) {
  config.addPlugin(HtmlBasePlugin);
  config.addPassthroughCopy({ "src/assets": "assets" });
  // 사용자 도메인. 배포할 때마다 함께 올라가야 설정이 유지된다
  config.addPassthroughCopy({ "src/CNAME": "CNAME" });
  // 검색엔진 소유 확인 파일. 최상위에 원래 이름 그대로 놓여야 한다
  config.addPassthroughCopy({ "src/verify": "." });
  config.addPassthroughCopy({ "src/icons": "." });

  // 글 목록: 최신 글이 위로
  config.addCollection("writing", (api) =>
    api.getFilteredByGlob("src/writing/*.md").sort((a, b) => b.date - a.date)
  );

  config.addFilter("byCategory", (items, key) => items.filter((i) => i.data.category === key));
  config.addFilter("onlyCategories", (items, keys) => items.filter((i) => keys.includes(i.data.category)));
  // CV의 '글 n편, 2025–26' 같은 줄. 글을 더하면 저절로 맞춰진다
  config.addFilter("yearSpan", (items) => {
    const ys = items.map((i) => new Date(i.date).getUTCFullYear());
    if (!ys.length) return "";
    const a = Math.min(...ys), b = Math.max(...ys);
    return a === b ? String(a) : `${a}–${String(b).slice(-2)}`;
  });

  config.addFilter("year", (d) => (d === "now" ? new Date() : new Date(d)).getUTCFullYear());

  // 2026-09-12 → 2026.9.12.
  config.addFilter("dot", (d) => {
    const x = new Date(d);
    return `${x.getUTCFullYear()}.${x.getUTCMonth() + 1}.${x.getUTCDate()}.`;
  });

  // 목록의 곁정보. 실린 곳에 이미 공연명(〈…〉)이 들어 있으면 작품·단체를 빼서 같은 이름이 두 번 나오지 않게 한다
  config.addFilter("subline", (data) => {
    const t = (data.work || "").match(/〈[^〉]+〉/);
    const dup = t && data.source && data.source.includes(t[0]);
    return [dup ? null : data.work, data.source].filter(Boolean);
  });

  // 배포할 때마다 바뀌는 값. 브라우저가 예전 스타일을 붙잡지 않게 한다
  config.addGlobalData("build", () => Date.now().toString(36));

  config.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  config.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  config.addFilter("byYear", (items) => {
    const out = [];
    for (const it of items) {
      const y = new Date(it.date).getUTCFullYear();
      let g = out.find((x) => x.year === y);
      if (!g) out.push((g = { year: y, items: [] }));
      g.items.push(it);
    }
    return out;
  });

  config.addFilter("iso", (d) => new Date(d).toISOString().slice(0, 10));

  const CAT = { criticism: "비평", brief: "단평", programme: "프로그램 글", academic: "논문", roundtable: "좌담·인터뷰" };
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

