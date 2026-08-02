import Link from 'next/link';
import { Sparkles, Bot, Eye, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: Bot,
    title: '多 Agent 协作',
    description:
      'Mike、Emma、Bob、Alex 分工协作，从需求到代码全自动流水线。',
  },
  {
    icon: Eye,
    title: '实时可视化预览',
    description: '生成的应用即时在右侧 Preview 面板渲染，所见即所得。',
  },
  {
    icon: Database,
    title: '数据持久化',
    description: '项目、生成历史云端保存，随时继续编辑与迭代。',
  },
  {
    icon: Sparkles,
    title: '自然语言驱动',
    description: '描述你的想法，AI 团队负责调研、规划、架构与开发。',
  },
];

const agents = [
  { name: 'Mike', role: 'Team Leader', color: 'bg-indigo-500' },
  { name: 'Emma', role: 'Product Manager', color: 'bg-pink-500' },
  { name: 'Bob', role: 'Architect', color: 'bg-violet-500' },
  { name: 'Alex', role: 'Engineer', color: 'bg-cyan-500' },
];

/**
 * Landing 主视觉区：标题、CTA、Agent 团队展示。
 */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background dark:from-indigo-950/40" />
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          Atoms 风格 Demo · 多智能体应用生成
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          将想法锻造成
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {' '}
            可运行的应用
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          通过 AI Agent 团队协作，从自然语言描述到可交互网页应用，分钟级完成生成与预览。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button render={<Link href="/register" />} nativeButton={false} size="lg">
            免费开始构建
          </Button>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            已有账号登录
          </Button>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-sm"
            >
              <span className={`size-2.5 rounded-full ${agent.color}`} />
              <span className="font-medium">{agent.name}</span>
              <span className="text-muted-foreground">{agent.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Landing 功能特性网格。
 */
export function LandingFeatures() {
  return (
    <section className="border-t bg-muted/30 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">一切所需，一站完成</h2>
          <p className="text-muted-foreground">
            研究、规划、编码、预览 — 模拟 Atoms 完整产品体验
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 bg-background shadow-sm">
              <CardHeader>
                <feature.icon className="mb-2 size-8 text-indigo-600" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Landing 底部 CTA。
 */
export function LandingCta() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-br from-indigo-50 to-violet-50 p-10 text-center dark:from-indigo-950/30 dark:to-violet-950/30">
        <h2 className="mb-4 text-2xl font-bold sm:text-3xl">准备好开始了吗？</h2>
        <p className="mb-8 text-muted-foreground">
          注册账号，创建你的第一个 AI 生成项目。
        </p>
        <Button render={<Link href="/register" />} nativeButton={false} size="lg">
          立即免费注册
        </Button>
      </div>
    </section>
  );
}
