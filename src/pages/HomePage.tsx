import "./HomePage.css";
import type { Navigate } from "../types/navigation";
import { HomeHero } from "../components/home/HomeHero";
import { HomeServices } from "../components/home/HomeServices";
import { HomePathway } from "../components/home/HomePathway";
import { HomeResources } from "../components/home/HomeResources";
import { HomeCta } from "../components/home/HomeCta";

interface HomePageProps {
  navigate: Navigate;
}

export function HomePage({ navigate }: HomePageProps) {
  return (
    <main className="lp">
      <HomeHero navigate={navigate} />
      <HomeServices navigate={navigate} />
      <HomePathway navigate={navigate} />
      <HomeResources navigate={navigate} />
      <HomeCta navigate={navigate} />
    </main>
  );
}
