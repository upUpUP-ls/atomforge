/**
 * Agent 流水线集成测试（Fallback 模式，无需 API Key）。
 * 运行：npm run test:agents
 */
import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client';
import { collectPipelineEvents } from '../src/features/agents/lib/orchestrator';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';
  const adapter = new PrismaBetterSqlite3({ url });
  const db = new PrismaClient({ adapter });

  const testEmail = `agent-test-${Date.now()}@test.com`;
  const user = await db.user.create({
    data: {
      email: testEmail,
      password: 'test-hash',
      name: 'Agent Test',
    },
  });

  const project = await db.project.create({
    data: {
      userId: user.id,
      title: 'Todo 测试项目',
      prompt: '一个简单的 Todo 待办事项应用，支持添加、完成、删除任务',
      status: 'draft',
    },
  });

  console.log(`\n🧪 测试项目: ${project.id}`);
  console.log(`   Prompt: ${project.prompt}\n`);

  const events = await collectPipelineEvents(project.id, project.prompt);

  const agents = events.filter((e) => e.type === 'agent_complete');
  const codeEvent = events.find(
    (e) => e.type === 'agent_complete' && e.artifactType === 'code',
  );
  const pipelineDone = events.some((e) => e.type === 'pipeline_complete');
  const hasError = events.some((e) => e.type === 'error');

  console.log(`✓ Agent 完成数: ${agents.length} / 4`);
  console.log(`✓ 流水线完成: ${pipelineDone ? '是' : '否'}`);
  console.log(`✓ Code artifact: ${codeEvent?.content?.includes('<html') ? '含 HTML' : '缺失'}`);

  const artifacts = await db.artifact.findMany({ where: { projectId: project.id } });
  console.log(`✓ DB artifacts: ${artifacts.length} 条`);

  const updated = await db.project.findUnique({ where: { id: project.id } });
  console.log(`✓ 项目状态: ${updated?.status}\n`);

  await db.user.delete({ where: { id: user.id } });

  if (hasError || agents.length !== 4 || !pipelineDone || !codeEvent?.content?.includes('<html')) {
    console.error('❌ 测试失败');
    process.exit(1);
  }

  console.log('✅ Phase 3 流水线测试通过（Fallback 模式）\n');
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
