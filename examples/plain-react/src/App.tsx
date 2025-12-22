import { MagicImage } from "@with-logic/magic-image";

function App() {
  return (
    <div className="container">
      <header>
        <h1>Magic Image Example</h1>
        <p>Hover over the images below to reveal the generation overlay.</p>
      </header>

      <main>
        <section className="example">
          <h2>Hero Image (16:9)</h2>
          <MagicImage
            src="https://placehold.co/800x450/e2e8f0/64748b?text=Hero+Image"
            alt="Hero illustration"
            prompt="A modern, minimalist hero illustration featuring abstract geometric shapes in soft purple and blue gradients, suitable for a tech startup landing page"
            aspectRatio="16:9"
            className="hero-image"
          />
        </section>

        <section className="example">
          <h2>Feature Card (4:3)</h2>
          <MagicImage
            src="https://placehold.co/400x300/f0fdf4/22c55e?text=Feature+Image"
            alt="Feature illustration"
            prompt="A clean illustration of a dashboard interface with charts and graphs, using green accent colors, flat design style"
            aspectRatio="4:3"
            className="feature-image"
          />
        </section>

        <section className="example">
          <h2>Team Photo (4:3)</h2>
          <MagicImage
            src="https://placehold.co/400x300/fef3c7/f59e0b?text=Team+Photo"
            alt="Team collaboration"
            prompt="An illustration of diverse team members collaborating around a table with laptops and sticky notes, warm and inviting atmosphere, modern office setting"
            aspectRatio="4:3"
            className="team-image"
          />
        </section>
      </main>

      <footer>
        <p>
          Generated images will be downloaded when you click Save. In a real
          app, you could configure a server-side save handler to write files
          directly to your project.
        </p>
      </footer>
    </div>
  );
}

export default App;
