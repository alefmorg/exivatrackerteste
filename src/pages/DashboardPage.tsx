import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import StatusDot from "@/components/StatusDot";
import { useSettings } from "@/hooks/useSettings";

import {
  VocationIcon,
  getVocationColor,
  ItemSprite
} from "@/components/TibiaIcons";

import { timeAgo } from "@/lib/utils";

import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import EmptyState from "@/components/EmptyState";
import { SkeletonPage } from "@/components/SkeletonLoader";

interface BonecoRow {
  id: string;
  name: string;
  level: number;
  vocation: string;
  world: string;
  status: string;
  activity: string;
  used_by: string;
  last_access: string;
  full_bless: boolean;
  premium_active: boolean;
  tibia_coins: number;
}

interface LogRow {
  id: string;
  boneco_name: string;
  username: string;
  action: string;
  notes: string;
  created_at: string;
}

export default function DashboardPage() {
  const settings = useSettings();

  const [bonecos, setBonecos] = useState<BonecoRow[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [{ data: bData }, { data: lData }] = await Promise.all([
      supabase
        .from("bonecos")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("boneco_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(settings.logLimit)
    ]);

    if (bData) setBonecos(bData as BonecoRow[]);
    if (lData) setRecentLogs(lData as LogRow[]);

    setLoading(false);
  }, [settings.logLimit]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonecos" },
        fetchData
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  if (loading) return <SkeletonPage />;

  // ======================
  // Stats
  // ======================

  const online = bonecos.filter((b) => b.status === "online");
  const afk = bonecos.filter((b) => b.status === "afk");
  const offline = bonecos.filter((b) => b.status === "offline");

  const inUse = bonecos.filter((b) => b.used_by);
  const free = bonecos.filter((b) => !b.used_by);
  const noBless = bonecos.filter((b) => !b.full_bless);

  const totalTC = bonecos.reduce((sum, b) => sum + (b.tibia_coins || 0), 0);

  const blessCount = bonecos.filter((b) => b.full_bless).length;
  const premiumCount = bonecos.filter((b) => b.premium_active).length;

  const userStats = recentLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.username] = (acc[l.username] || 0) + 1;
    return acc;
  }, {});

  const topUsers = Object.entries(userStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <PageHeader
        title="COMMAND CENTER"
        icon="dashboard"
        subtitle={`${bonecos.length} personagens monitorados`}
      />

      {/* STATUS BAR */}

      <div className="panel p-3 flex gap-6">
        <Status label="ONLINE" value={online.length} sprite="online" />
        <Status label="AFK" value={afk.length} sprite="afk" />
        <Status label="OFFLINE" value={offline.length} sprite="offline" />
        <Status label="EM USO" value={inUse.length} sprite="login" />
      </div>

      {/* METRICS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          label="TC TOTAL"
          value={totalTC.toLocaleString()}
          sprite="tibiaCoin"
        />

        <MetricCard
          label="BLESS"
          value={`${blessCount}/${bonecos.length}`}
          sprite="bless"
        />

        <MetricCard
          label="PREMIUM"
          value={`${premiumCount}/${bonecos.length}`}
          sprite="premiumScroll"
        />

        <MetricCard
          label="LIVRES"
          value={free.length.toString()}
          sprite="online"
          highlight
        />
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* FEED */}

        <div className="panel lg:col-span-2 overflow-hidden">
          <div className="border-b px-4 py-2 flex items-center gap-2">
            <ItemSprite item="history" className="h-5 w-5" />
            <span className="text-xs font-semibold">LIVE FEED</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {recentLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-4 py-2 border-b border-border/40"
                >
                  <ItemSprite
                    item={log.action === "pegar" ? "login" : "logout"}
                    className="h-5 w-5"
                  />

                  <div className="flex-1 text-xs">
                    <span className="font-semibold">{log.username}</span>{" "}
                    {log.action === "pegar" ? "pegou" : "devolveu"}{" "}
                    <span className="text-primary font-semibold">
                      {log.boneco_name}
                    </span>
                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(log.created_at)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {recentLogs.length === 0 && (
              <EmptyState
                icon="history"
                title="Sem atividade"
                description="Nenhum log registrado"
              />
            )}
          </div>
        </div>

        {/* SIDEBAR */}

        <div className="space-y-3">
          <SidePanel title="EM USO" count={inUse.length}>
            {inUse.map((b) => (
              <CharRow key={b.id} boneco={b} right={b.used_by} />
            ))}
          </SidePanel>

          <SidePanel title="DISPONÍVEIS" count={free.length}>
            {free.slice(0, 8).map((b) => (
              <CharRow key={b.id} boneco={b} />
            ))}
          </SidePanel>

          <SidePanel title="SEM BLESS" count={noBless.length}>
            {noBless.map((b) => (
              <CharRow key={b.id} boneco={b} />
            ))}
          </SidePanel>

          <SidePanel title="TOP USERS" count={topUsers.length}>
            {topUsers.map(([name, count], i) => (
              <div key={name} className="flex justify-between text-xs">
                <span>{name}</span>
                <span className="font-mono">{count}</span>
              </div>
            ))}
          </SidePanel>
        </div>
      </div>
    </div>
  );
}

function Status({ label, value, sprite }: any) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <ItemSprite item={sprite} className="h-5 w-5" />
      <span className="font-bold">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function CharRow({ boneco, right }: any) {
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      <StatusDot status={boneco.status} size="sm" />
      <VocationIcon
        vocation={boneco.vocation}
        className={`h-3 w-3 ${getVocationColor(boneco.vocation)}`}
      />
      <span className="flex-1 truncate">
        {boneco.name} {boneco.level}
      </span>

      {right && <span className="text-primary text-[10px]">{right}</span>}
    </div>
  );
}

function SidePanel({ title, count, children }: any) {
  return (
    <div className="panel p-3">
      <div className="flex justify-between mb-2 text-xs font-semibold">
        <span>{title}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>

      <div className="space-y-1">{children}</div>
    </div>
  );
}
