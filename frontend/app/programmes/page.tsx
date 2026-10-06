import PageHero from "@/components/shared/PageHero";
import Container from "@/components/shared/Container";
import ProjectCard from "@/components/shared/ProjectCard";
import {readHomeFeed,projectCard,type ProjectRecord} from "@/lib/home-feed";
export const dynamic="force-dynamic";
export default async function Page(){
 const result=await readHomeFeed<ProjectRecord>("projects",48);
 return <main id="main-content"><PageHero eyebrow="HRPF Pakistan" title="Our Projects" description="Projects published by the Foundation."/><Container className="py-16 sm:py-20 lg:py-24">{result.data.length?<ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{result.data.map(row=>{const project=projectCard(row);return <li key={project.slug}><ProjectCard project={project} startedLabel={project.startedLabel}/></li>;})}</ul>:<p className="text-muted">{result.status==="unavailable"?"Project updates could not be loaded. Please try again later.":"Project updates will appear here as they are added."}</p>}</Container></main>;
}
