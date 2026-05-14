"use client"

import { useMemo } from "react"
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

type Variant = {
  id: string
  name: string
  weight: number
}

export function VisualFlow({
  slug,
  variants,
  totalClicks,
  variantClicks,
}: {
  slug: string
  variants: Variant[]
  totalClicks: number
  variantClicks: Record<string, number>
}) {
  const { nodes, edges } = useMemo(() => {
    const centerX = 400
    const centerY = 250
    const sourceX = 50
    const targetX = 800

    const nodeList: Node[] = []
    const edgeList: Edge[] = []

    nodeList.push({
      id: "source",
      type: "default",
      position: { x: sourceX, y: centerY - 30 },
      data: { label: "Tráfego" },
      style: {
        background: "var(--primary, #0f172a)",
        color: "var(--primary-foreground, #fff)",
        border: "none",
        borderRadius: 20,
        padding: "8px 20px",
        fontSize: 13,
        fontWeight: 600,
      },
    })

    nodeList.push({
      id: "splitly",
      type: "default",
      position: { x: centerX, y: centerY - 30 },
      data: { label: `Splitly /r/${slug}` },
      style: {
        background: "var(--card, #fff)",
        color: "var(--foreground, #0f172a)",
        border: "2px solid var(--primary, #0f172a)",
        borderRadius: 12,
        padding: "10px 24px",
        fontSize: 13,
        fontWeight: 700,
      },
    })

    edgeList.push({
      id: "source-splitly",
      source: "source",
      target: "splitly",
      animated: true,
      style: { stroke: "var(--primary, #0f172a)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary, #0f172a)" },
    })

    const variantColors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]

    variants.forEach((v, i) => {
      const yOffset = (i - (variants.length - 1) / 2) * 100
      const clicks = variantClicks[v.id] || 0
      const barPct = totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0

      nodeList.push({
        id: `variant-${v.id}`,
        type: "default",
        position: { x: targetX - 50, y: centerY + yOffset - 30 },
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold text-xs">{v.name}</div>
              <div className="text-[10px] opacity-70">{v.weight}% do tráfego</div>
              {clicks > 0 && (
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(barPct, 2)}%`,
                      background: variantColors[i % variantColors.length],
                    }}
                  />
                </div>
              )}
              <div className="text-[10px] mt-0.5 opacity-60">{clicks} cliques</div>
            </div>
          ) as unknown as string,
        },
        style: {
          background: "var(--card, #fff)",
          color: "var(--foreground, #0f172a)",
          border: "2px solid var(--border, #e2e8f0)",
          borderRadius: 12,
          padding: "10px 20px",
          fontSize: 12,
          minWidth: 140,
        },
      })

      edgeList.push({
        id: `splitly-variant-${v.id}`,
        source: "splitly",
        target: `variant-${v.id}`,
        label: `${v.weight}%`,
        style: {
          stroke: variantColors[i % variantColors.length],
          strokeWidth: 2,
        },
        labelStyle: {
          fill: "var(--foreground, #0f172a)",
          fontSize: 11,
          fontWeight: 600,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: variantColors[i % variantColors.length],
        },
      })

      nodeList.push({
        id: `checkout-${v.id}`,
        type: "default",
        position: { x: targetX + 200, y: centerY + yOffset - 20 },
        data: { label: "Checkout" },
        style: {
          background: "var(--muted, #f1f5f9)",
          color: "var(--muted-foreground, #64748b)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 11,
        },
      })

      edgeList.push({
        id: `variant-checkout-${v.id}`,
        source: `variant-${v.id}`,
        target: `checkout-${v.id}`,
        style: {
          stroke: "var(--border, #e2e8f0)",
          strokeWidth: 1.5,
          strokeDasharray: "5 5",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--border, #e2e8f0)",
        },
      })
    })

    return { nodes: nodeList, edges: edgeList }
  }, [slug, variants, totalClicks, variantClicks])

  const defaultViewport = { x: 0, y: 0, zoom: 0.75 }

  return (
    <div className="w-full h-[400px] rounded-xl border border-border bg-background overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={defaultViewport}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border, #e2e8f0)" gap={20} />
        <Controls
          className="!rounded-lg !border !border-border !bg-background !shadow-sm"
          position="bottom-right"
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === "source") return "var(--primary, #0f172a)"
            if (n.id === "splitly") return "var(--primary, #0f172a)"
            if (n.id.startsWith("variant")) return "#6366f1"
            return "var(--muted, #f1f5f9)"
          }}
          className="!rounded-lg !border !border-border"
          position="bottom-left"
        />
      </ReactFlow>
    </div>
  )
}
