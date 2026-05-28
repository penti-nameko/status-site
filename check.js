const fs = require('fs');

// 監視したいサイトの一覧（ここにURLを追加・編集してください）
const targets = [
  { name: "k8s クラスタ (ReelDev)", url: "https://ping.reeldev.jp" },
  { name: "公式サイト", url: "https://example.com" },
  { name: "テスト用API", url: "https://httpbin.org/status/200" }
];

async function checkStatus() {
  const results = [];

  for (const target of targets) {
    try {
      // タイムアウト5秒でfetch
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(target.url, { signal: controller.signal });
      clearTimeout(id);

      if (response.ok) {
        results.push({ name: target.name, url: target.url, status: "ONLINE", code: response.status });
      } else {
        results.push({ name: target.name, url: target.url, status: "OFFLINE", code: response.status });
      }
    } catch (error) {
      results.push({ name: target.name, url: target.url, status: "OFFLINE", error: error.message });
    }
  }

  const output = {
    last_updated: new Date().toISOString(),
    sites: results
  };

  fs.writeFileSync('status.json', JSON.stringify(output, null, 2));
  console.log("ステータスチェック完了:", output);
}

checkStatus();
