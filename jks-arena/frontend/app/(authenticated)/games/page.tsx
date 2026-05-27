import GamesSection from "@/components/GamesSection";

export const metadata = {
  title: "Games Library | JKS Arena",
};

export default function GamesPage() {
  return (
    <div className="px-4 md:px-6 py-6 max-w-[1200px] mx-auto pb-24 md:pb-6">
      <GamesSection title="All Games" />
    </div>
  );
}
