const project = document.getElementById("project");
const button = document.getElementById("recommend");
const result = document.getElementById("result");

const recommendations = {
  static: "Consider static hosting such as GitHub Pages or Cloudflare Pages.",
  nextjs: "Consider Vercel for managed Next.js hosting, or a VPS if you need more control.",
  docker: "Consider a VPS such as DigitalOcean, Hetzner or AWS EC2 if you can manage Docker.",
  backend: "Compare managed application hosting with a VPS based on database and operations needs."
};

button.addEventListener("click", () => {
  result.textContent = recommendations[project.value];
});
