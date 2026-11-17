import { notFound } from "next/navigation";
import { CATALOGUE, getActe, isAvailable } from "@/lib/catalogue";
import { Wizard } from "@/components/Wizard";

export function generateStaticParams() {
  return CATALOGUE.filter(isAvailable).map((a) => ({ id: a.id }));
}

export default async function Rediger({ params }: { params: Promise<{ id: string }> }) {
  const act = getActe((await params).id);
  if (!act || !isAvailable(act)) notFound();
  return <Wizard actId={act.id} />;
}
