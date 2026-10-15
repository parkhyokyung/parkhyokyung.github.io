// 이 폴더의 글 파일에 공통으로 적용되는 설정입니다. 고칠 필요가 없습니다.
// 본문이 있는 글은 사이트 안에 글 페이지가 생기고,
// 본문 없이 link만 있는 글은 목록에서 원문으로 바로 연결됩니다.
import fs from "node:fs";

function hasBody(inputPath) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
  return Boolean(m && m[1].trim());
}

export default {
  layout: "post.njk",
  categoryLabel: { criticism: "Criticism", programme: "Programme", academic: "Academic" },
  eleventyComputed: {
    hasPage: (data) => hasBody(data.page.inputPath),
    permalink: (data) => (hasBody(data.page.inputPath) ? `/writing/${data.page.fileSlug}/` : false),
  },
};
