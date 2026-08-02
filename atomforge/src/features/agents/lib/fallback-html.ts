import { matchFallbackTemplate } from './fallback';

const TODO_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Todo App</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;min-height:100vh;padding:2rem}
.app{max-width:480px;margin:0 auto}h1{font-size:1.5rem;margin-bottom:1rem}
.input-row{display:flex;gap:.5rem;margin-bottom:1rem}input{flex:1;padding:.6rem .8rem;border:1px solid #e2e8f0;border-radius:.5rem;font-size:1rem}
button{padding:.6rem 1rem;background:#6366f1;color:#fff;border:none;border-radius:.5rem;cursor:pointer;font-size:.875rem}
button:hover{background:#4f46e5}.todo-list{list-style:none}.todo-item{display:flex;align-items:center;gap:.75rem;padding:.75rem;background:#fff;border:1px solid #e2e8f0;border-radius:.5rem;margin-bottom:.5rem}
.todo-item.done span{text-decoration:line-through;color:#94a3b8}.todo-item button{background:#ef4444;padding:.25rem .5rem;font-size:.75rem}
.stats{margin-top:1rem;font-size:.875rem;color:#64748b}
</style>
</head>
<body>
<div class="app"><h1>✅ Todo App</h1>
<div class="input-row"><input id="input" placeholder="添加新任务..." /><button onclick="addTodo()">添加</button></div>
<ul id="list" class="todo-list"></ul><p id="stats" class="stats"></p></div>
<script>
const KEY='todos';let todos=JSON.parse(localStorage.getItem(KEY)||'[]');
function save(){localStorage.setItem(KEY,JSON.stringify(todos));render()}
function render(){const list=document.getElementById('list');list.innerHTML=todos.map(t=>'<li class="todo-item'+(t.done?' done':'')+'"><input type="checkbox"'+(t.done?' checked':'')+' onchange="toggle('+t.id+')"><span>'+t.text+'</span><button onclick="remove('+t.id+')">删除</button></li>').join('');
document.getElementById('stats').textContent='共 '+todos.length+' 项，已完成 '+todos.filter(t=>t.done).length+' 项'}
function addTodo(){const input=document.getElementById('input');const text=input.value.trim();if(!text)return;todos.push({id:Date.now(),text,done:false});input.value='';save()}
function toggle(id){todos=todos.map(t=>t.id===id?{...t,done:!t.done}:t);save()}
function remove(id){todos=todos.filter(t=>t.id!==id);save()}render();
</script></body></html>`;

const LANDING_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SaaS Landing</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;color:#0f172a}
.hero{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:4rem 2rem;text-align:center}
.hero h1{font-size:2.5rem;margin-bottom:1rem}.hero p{opacity:.9;margin-bottom:2rem;font-size:1.125rem}
.cta{display:inline-block;background:#fff;color:#6366f1;padding:.75rem 2rem;border-radius:2rem;font-weight:600;text-decoration:none}
section{padding:3rem 2rem;max-width:960px;margin:0 auto}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-top:2rem}
.feature{padding:1.5rem;border:1px solid #e2e8f0;border-radius:.75rem}
.pricing{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-top:2rem}
.plan{flex:1;min-width:200px;max-width:280px;padding:2rem;border:2px solid #e2e8f0;border-radius:1rem;text-align:center}
.plan.featured{border-color:#6366f1;background:#f5f3ff}
.plan h3{font-size:2rem;margin:.5rem 0}.faq{margin-top:2rem}.faq details{padding:1rem;border-bottom:1px solid #e2e8f0}
footer{text-align:center;padding:2rem;background:#f8fafc;color:#64748b}
</style>
</head>
<body>
<section class="hero"><h1>Build Faster with AI</h1><p>将想法转化为可运行的产品，分钟级交付</p><a href="#" class="cta">免费开始</a></section>
<section><h2>核心功能</h2><div class="features">
<div class="feature"><h3>🚀 快速启动</h3><p>自然语言描述，AI 自动生成</p></div>
<div class="feature"><h3>🤖 多 Agent</h3><p>PM、架构师、工程师协作</p></div>
<div class="feature"><h3>👁 实时预览</h3><p>所见即所得，即时验证</p></div>
</div></section>
<section><h2>定价</h2><div class="pricing">
<div class="plan"><h4>Free</h4><h3>$0</h3><p>基础功能</p></div>
<div class="plan featured"><h4>Pro</h4><h3>$19</h3><p>无限项目</p></div>
</div></section>
<section><h2>FAQ</h2><div class="faq">
<details><summary>需要编程经验吗？</summary><p>不需要，自然语言即可构建。</p></details>
<details><summary>可以导出代码吗？</summary><p>可以，支持下载完整 HTML。</p></details>
</div></section>
<footer>© 2026 AtomForge Demo</footer>
</body></html>`;

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f1f5f9;padding:2rem;color:#0f172a}
h1{margin-bottom:1.5rem}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem}
.kpi{background:#fff;padding:1.25rem;border-radius:.75rem;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.kpi .label{font-size:.875rem;color:#64748b}.kpi .value{font-size:1.75rem;font-weight:700;margin-top:.25rem}
.chart-box{background:#fff;padding:1.5rem;border-radius:.75rem;box-shadow:0 1px 3px rgba(0,0,0,.08)}
</style>
</head>
<body>
<h1>📊 Data Dashboard</h1>
<div class="kpis">
<div class="kpi"><div class="label">总用户</div><div class="value">12,847</div></div>
<div class="kpi"><div class="label">月收入</div><div class="value">$48.2k</div></div>
<div class="kpi"><div class="label">转化率</div><div class="value">3.2%</div></div>
<div class="kpi"><div class="label">活跃用户</div><div class="value">8,291</div></div>
</div>
<div class="chart-box"><canvas id="chart"></canvas></div>
<script>
new Chart(document.getElementById('chart'),{type:'bar',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Revenue ($k)',data:[32,38,41,45,44,48],backgroundColor:'#6366f1'}]},options:{responsive:true,plugins:{legend:{display:false}}}});
</script></body></html>`;

const GENERIC_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generated App</title>
<style>
body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:2rem}
.card{background:rgba(255,255,255,.15);backdrop-filter:blur(10px);padding:3rem;border-radius:1rem;max-width:480px}
h1{margin-bottom:1rem}p{opacity:.9;line-height:1.6}button{margin-top:1.5rem;padding:.75rem 2rem;background:#fff;color:#667eea;border:none;border-radius:2rem;font-weight:600;cursor:pointer}
</style>
</head>
<body>
<div class="card"><h1>🎉 App Ready</h1><p id="msg">Your AI-generated app is running.</p><button onclick="alert('Hello from AtomForge!')">Click Me</button></div>
<script>document.getElementById('msg').textContent='Prompt: '+decodeURIComponent(location.hash.slice(1)||'demo');</script>
</body></html>`;

/**
 * 根据 prompt 返回 Fallback 单页 HTML 代码。
 */
export function getFallbackHtml(prompt: string): string {
  const kind = matchFallbackTemplate(prompt);
  switch (kind) {
    case 'todo':
      return TODO_HTML;
    case 'landing':
      return LANDING_HTML;
    case 'dashboard':
      return DASHBOARD_HTML;
    default:
      return GENERIC_HTML;
  }
}

/**
 * 从 LLM 输出中提取 HTML（去除 markdown 代码块包裹）。
 */
export function extractHtmlFromResponse(text: string): string {
  const htmlBlock = text.match(/```html\n?([\s\S]*?)```/);
  if (htmlBlock) {
    return htmlBlock[1].trim();
  }

  const anyBlock = text.match(/```\n?([\s\S]*?)```/);
  if (anyBlock && anyBlock[1].includes('<html')) {
    return anyBlock[1].trim();
  }

  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    const start = text.indexOf('<!DOCTYPE') >= 0
      ? text.indexOf('<!DOCTYPE')
      : text.indexOf('<html');
    const end = text.lastIndexOf('</html>');
    if (end > start) {
      return text.slice(start, end + 7);
    }
  }

  return text.trim();
}
