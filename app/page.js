import Hero from "@/components/Hero/Hero";
import Intro from "@/components/Intro/Intro";
import Partners from "@/components/Partners/Partners";
import PlayByPlay from "@/components/PlayByPlay/PlayByPlay";
import UpcomingGames from "@/components/UpcomingGames/UpcomingGames";


export default function Home() {
  return (
    <div>
      <Hero />
      <Intro />
      <Partners />
      <PlayByPlay />
      <UpcomingGames />
    </div>
  );
}
