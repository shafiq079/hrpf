import { Shield } from "lucide-react";
import CardGrid, { cardGridCellClass } from "@/components/shared/CardGrid";
import FocusAreaCard from "@/components/shared/FocusAreaCard";
import Reveal from "@/components/shared/Reveal";
import { Blocks } from "@/components/content/ContentView";
import type { Block } from "@/lib/public-content";
export default function PillarCards({
  blocks,
  limit,
}: {
  blocks: Block[];
  limit?: number;
}) {
  const cards: { title: string; description: string }[] = [];
  for (const block of blocks) {
    if (block.type === "heading" && block.text)
      cards.push({ title: block.text, description: "" });
    else if (cards.length) {
      const text = block.type === "list" ? block.items?.join("; ") : block.text;
      if (text)
        cards[cards.length - 1].description +=
          `${cards[cards.length - 1].description ? " " : ""}${text}`;
    }
  }
  if (!cards.length) return <Blocks blocks={blocks} />;
  return (
    <CardGrid cols={3} className="mt-12">
      {cards.slice(0, limit).map((card, i) => (
        <li key={`${i}-${card.title}`} className={cardGridCellClass}>
          <Reveal delay={(i % 3) * 0.08} className="h-full">
            <FocusAreaCard area={{ ...card, icon: Shield }} />
          </Reveal>
        </li>
      ))}
    </CardGrid>
  );
}
