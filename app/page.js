import Hero from "../components/Hero/Hero";
import Intro from "../components/Intro/Intro";
import Partners from "../components/Partners/Partners";
import PlayByPlay from "../components/PlayByPlay/PlayByPlay";
import UpcomingGames from "../components/UpcomingGames/UpcomingGames";


export default function Home() {
  return (
    <div className="px-6 md:px-10 lg:px-16 xl:px-20 ">
      <Hero />
      <Intro />
      <PlayByPlay />
      <UpcomingGames />
      {/* <Partners /> */}
    </div>
  );
}
