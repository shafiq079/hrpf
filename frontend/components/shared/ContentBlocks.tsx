import TranslationText from "@/components/translation/TranslationText";
import Prose from "./Prose";
export type TextBlock = { type: string; text?: string; items?: string[] };
export default function ContentBlocks({ blocks }: { blocks: TextBlock[] }) {
  return <Prose>{blocks.map((block, index) => (
    block.type === "heading" ? <h2 key={index}><TranslationText>{block.text}</TranslationText></h2> :
    block.type === "list" ? <ul key={index}>{block.items?.map((item, i) => <li key={i}><TranslationText>{item}</TranslationText></li>)}</ul> :
    <p key={index}><TranslationText>{block.text}</TranslationText></p>
  ))}</Prose>;
}
