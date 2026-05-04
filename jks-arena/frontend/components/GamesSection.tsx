import { API_BASE_URL } from "@/lib/auth";

const games = [
  {
    name: "FIFA 26",
    tagline: "Ultimate club nights",
    images: ["FIFA-1.jpg", "FIFA-2.jpg", "FIFA-3.jpg"],
  },
  {
    name: "WWE 2K26",
    tagline: "Tag team rivalries",
    images: ["WWE2K26-1.jpg", "WWE2K26-2.jpg", "WWE2K26-3.jpg", "WWE2K26-4.jpg"],
  },
  {
    name: "It's Take Two",
    tagline: "Co-op chaos",
    images: [
      "It'sTakeTwo-1.jpg",
      "It'sTakeTwo-2.jpg",
      "It'sTakeTwo-3.jpg",
      "It'sTakeTwo-4.jpg",
    ],
  },
  {
    name: "Asphalt 9",
    tagline: "Street racing rush",
    images: ["ASPHALT-1.jpg", "ASPHALT-2.jpg", "ASPHALT-3.jpg"],
  },
  {
    name: "Forza Horizon 5",
    tagline: "Simulator rig",
    images: ["FORZA-1.jpg", "FORZA-2.jpg", "FORZA-3.jpg", "FORZA-4.jpg"],
  },
];

function buildImageUrl(filename: string) {
  const base = API_BASE_URL || "";
  return encodeURI(`${base}/photos/Games/${filename}`);
}

export default function GamesSection({ title }: { title: string }) {
  return (
    <section className="mt-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Games library</p>
          <h2 className="font-display text-4xl text-white md:text-5xl">{title}</h2>
        </div>
        <p className="max-w-xl text-sm text-slate-400">
          Slide through the games waiting on our rigs and the driving simulator.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {games.map((game) => (
          <div
            key={game.name}
            className="game-card flex flex-col gap-6 rounded-[28px] border border-slate-800/80 bg-slate-950/60 p-5 sm:rounded-[32px] sm:p-6 md:flex-row md:items-center"
          >
            <div
              className="game-slider"
              style={
                {
                  "--slide-count": game.images.length,
                  "--slide-total": game.images.length * 2,
                } as React.CSSProperties
              }
            >
              <div
                className="game-slider-track"
                style={{ animationDuration: `${game.images.length * 3.2}s` }}
              >
                {[...game.images, ...game.images].map((image, index) => (
                  <div key={`${image}-${index}`} className="game-slide">
                    <img
                      src={buildImageUrl(image)}
                      alt={game.name}
                      className="h-full w-full rounded-3xl object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-200">Featured</p>
              <h3 className="font-display mt-3 text-2xl text-white sm:text-3xl md:text-4xl">{game.name}</h3>
              <p className="mt-3 text-sm text-slate-400">{game.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-300">
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  {game.images.length} highlights
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1">Ready now</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
