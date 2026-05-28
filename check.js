const fs = require('fs');

// 監視対象のドメインリスト
const targets = [
  { name: "ReelDev Main", url: "https://reeldev.jp" },
  { name: "Beta Link", url: "https://betalink.reeldev.jp" },
  { name: "Beta App", url: "https://beta.reeldev.jp" },
  { name: "Cloud Management", url: "https://cloud.reeldev.jp" },
  { name: "Coolify (Deployment)", url: "https://coolify.reeldev.jp" },
  { name: "Dashboard", url: "https://dashboard.reeldev.jp" },
  { name: "Generator Service", url: "https://generator.reeldev.jp" },
  { name: "Links Shortener", url: "https://links.reeldev.jp" },
  { name: "Rielu Official", url: "https://rieluofficial.reeldev.jp" },
  { name: "Wiki / Docs", url: "https://wiki.reeldev.jp" }
];

async function checkStatus() {
  const results = [];

  for (const target of targets) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000); // タイムアウトを少し余裕を持たせて6秒に設定
      
      const response = await fetch(target.url, { 
        method: 'GET',
        headers: {
          'User-Agent': 'ReelDev-Status-Bot/1.0'
        },
        signal: controller.signal 
      });
      clearTimeout(id);

      // 200〜399番台のステータスコード（正常またはリダイレクト）をONLINEと判定
      if (response.status >= 200 && response.status < 400) {
        results.push({ name: target.name, url: target.url, status: "ONLINE", code: response.status });
      } else {
        results.push({ name: target.name, url: target.url, status: "OFFLINE", code: response.status });
      }
    } catch (error) {
      results.push({ name: target.name, url: target.url, status: "OFFLINE", error: error.message });
    }
  }

  // JST（日本標準時）の表記に変換して保存
  const options = { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const jstTime = new Intl.DateTimeFormat('ja-JP', options).format(new Date());

  const output = {
    last_updated: jstTime,
    sites: results
  };

  fs.writeFileSync('status.json', JSON.stringify(output, null, 2));
  console.log("全サイトのチェックが完了しました。");
}

checkStatus();
