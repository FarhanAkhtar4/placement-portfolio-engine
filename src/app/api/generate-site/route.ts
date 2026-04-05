import { NextRequest, NextResponse } from "next/server";
import type { PortfolioData } from "@/types/portfolio";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const portfolio: PortfolioData = body.portfolio;

    if (!portfolio || !portfolio.name) {
      return NextResponse.json(
        { success: false, error: "Valid portfolio data is required" },
        { status: 400 }
      );
    }

    const html = generateHTML(portfolio);

    return NextResponse.json({
      success: true,
      html,
      filename: `${portfolio.name.replace(/\s+/g, "-").toLowerCase()}-portfolio.html`,
    });
  } catch (error) {
    console.error("Site generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate site";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function generateHTML(data: PortfolioData): string {
  const skillsHTML = data.skills
    .map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
    .join("\n        ");

  const projectsHTML = data.projects
    .map(
      (project) => `
      <article class="project-card">
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-description">${escapeHtml(project.description)}</p>
        ${project.tech.length > 0 ? `<div class="project-tech">${project.tech.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join(" ")}</div>` : ""}
        ${project.impact ? `<p class="project-impact"><strong>Impact:</strong> ${escapeHtml(project.impact)}</p>` : ""}
      </article>`
    )
    .join("");

  const contactItems: string[] = [];
  if (data.contact.email) contactItems.push(`<a href="mailto:${escapeHtml(data.contact.email)}" class="contact-link">${escapeHtml(data.contact.email)}</a>`);
  if (data.contact.phone) contactItems.push(`<span class="contact-item">${escapeHtml(data.contact.phone)}</span>`);
  if (data.contact.linkedin) contactItems.push(`<a href="https://${escapeHtml(data.contact.linkedin).replace(/^https?:\/\//, "")}" target="_blank" rel="noopener noreferrer" class="contact-link">LinkedIn</a>`);
  if (data.contact.github) contactItems.push(`<a href="https://${escapeHtml(data.contact.github).replace(/^https?:\/\//, "")}" target="_blank" rel="noopener noreferrer" class="contact-link">GitHub</a>`);
  if (data.contact.website) contactItems.push(`<a href="${escapeHtml(data.contact.website)}" target="_blank" rel="noopener noreferrer" class="contact-link">Website</a>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.name)} | Portfolio</title>
  <meta name="description" content="${escapeHtml(data.hero)}">
  <meta property="og:title" content="${escapeHtml(data.name)} | Portfolio">
  <meta property="og:description" content="${escapeHtml(data.hero)}">
  <meta property="og:type" content="website">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --color-bg: #ffffff;
      --color-text: #1a1a2e;
      --color-text-light: #4a4a68;
      --color-primary: #0f172a;
      --color-accent: #2563eb;
      --color-border: #e5e7eb;
      --color-card-bg: #f9fafb;
      --color-tag-bg: #f0f4ff;
      --color-tag-text: #1e40af;
      --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
    }

    body {
      font-family: var(--font-sans);
      color: var(--color-text);
      background: var(--color-bg);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Hero Section */
    .hero {
      padding: 80px 0 48px;
      text-align: center;
    }

    .hero h1 {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--color-primary);
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }

    .hero .title {
      font-size: 1.25rem;
      color: var(--color-accent);
      font-weight: 500;
      margin-bottom: 20px;
    }

    .hero .tagline {
      font-size: 1.125rem;
      color: var(--color-text-light);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Section styling */
    .section {
      padding: 48px 0;
      border-top: 1px solid var(--color-border);
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--color-text-light);
      margin-bottom: 24px;
    }

    /* About Section */
    .about p {
      font-size: 1.0625rem;
      color: var(--color-text-light);
      line-height: 1.8;
    }

    /* Skills Section */
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      display: inline-block;
      padding: 6px 16px;
      background: var(--color-tag-bg);
      color: var(--color-tag-text);
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Projects Section */
    .projects-grid {
      display: grid;
      gap: 24px;
    }

    .project-card {
      background: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      transition: box-shadow 0.2s ease;
    }

    .project-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .project-card h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 8px;
    }

    .project-description {
      color: var(--color-text-light);
      font-size: 0.9375rem;
      margin-bottom: 12px;
    }

    .project-tech {
      margin-bottom: 12px;
    }

    .tech-tag {
      display: inline-block;
      padding: 2px 10px;
      background: var(--color-tag-bg);
      color: var(--color-tag-text);
      border-radius: 4px;
      font-size: 0.8125rem;
      font-family: var(--font-mono);
      margin-right: 6px;
    }

    .project-impact {
      font-size: 0.875rem;
      color: var(--color-text);
      font-style: italic;
    }

    /* Contact Section */
    .contact-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .contact-link {
      color: var(--color-accent);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9375rem;
      transition: color 0.15s ease;
    }

    .contact-link:hover {
      color: var(--color-primary);
      text-decoration: underline;
    }

    .contact-item {
      color: var(--color-text-light);
      font-size: 0.9375rem;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 32px 0;
      color: var(--color-text-light);
      font-size: 0.8125rem;
      border-top: 1px solid var(--color-border);
    }

    /* Responsive */
    @media (max-width: 640px) {
      .hero {
        padding: 56px 0 32px;
      }

      .hero h1 {
        font-size: 2rem;
      }

      .hero .title {
        font-size: 1.0625rem;
      }

      .section {
        padding: 32px 0;
      }

      .project-card {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero -->
    <header class="hero">
      <h1>${escapeHtml(data.name)}</h1>
      <p class="title">${escapeHtml(data.title)}</p>
      <p class="tagline">${escapeHtml(data.hero)}</p>
    </header>

    <!-- About -->
    ${data.about ? `<section class="section about">
      <h2 class="section-title">About</h2>
      <p>${escapeHtml(data.about)}</p>
    </section>` : ""}

    <!-- Skills -->
    ${data.skills.length > 0 ? `<section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">
        ${skillsHTML}
      </div>
    </section>` : ""}

    <!-- Projects -->
    ${data.projects.length > 0 ? `<section class="section">
      <h2 class="section-title">Projects</h2>
      <div class="projects-grid">
        ${projectsHTML}
      </div>
    </section>` : ""}

    <!-- Contact -->
    ${contactItems.length > 0 ? `<section class="section">
      <h2 class="section-title">Contact</h2>
      <div class="contact-grid">
        ${contactItems.join("\n        ")}
      </div>
    </section>` : ""}

    <!-- Footer -->
    <footer class="footer">
      <p>Built with Placement Portfolio Engine</p>
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
