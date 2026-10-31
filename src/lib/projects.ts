import type { SceneKind } from "@/components/art";

export const PROJECTS: { id: string; kind: SceneKind; key: string; type: "home" | "business" }[] = [
  { id: "1", kind: "living", key: "projects.p1", type: "home" },
  { id: "2", kind: "dining", key: "projects.p2", type: "home" },
  { id: "3", kind: "hall", key: "projects.p3", type: "home" },
  { id: "4", kind: "school", key: "projects.p4", type: "business" },
  { id: "5", kind: "clinic", key: "projects.p5", type: "business" },
  { id: "6", kind: "theatre", key: "projects.p6", type: "business" },
  { id: "7", kind: "office", key: "projects.p7", type: "business" },
  { id: "8", kind: "cafe", key: "projects.p8", type: "business" },
];
