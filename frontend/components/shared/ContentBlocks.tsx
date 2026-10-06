import Prose from "./Prose";
export type TextBlock = { type: string; text?: string; items?: string[] };
export default function ContentBlocks({ blocks }: { blocks: TextBlock[] }) {
  return <Prose>{blocks.map((block, index) => (
    block.type === "heading" ? <h2 key={index}>{block.text}</h2> :
    block.type === "list" ? <ul key={index}>{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul> :
    <p key={index}>{block.text}</p>
  ))}</Prose>;
}
