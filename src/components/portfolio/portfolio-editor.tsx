"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";

function EditableField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = () => {
    onChange(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        {multiline ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            placeholder={placeholder}
            className="min-h-[80px] resize-y"
            autoFocus
          />
        ) : (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            placeholder={placeholder}
            autoFocus
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="group relative cursor-pointer rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-muted/60"
      onClick={startEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") startEdit();
      }}
    >
      <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <p className="flex-1 text-sm leading-relaxed">
          {value || (
            <span className="text-muted-foreground/40 italic">
              Click to edit...
            </span>
          )}
        </p>
        <Pencil className="size-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}

function SkillEditor() {
  const skills = usePortfolioStore((s) => s.portfolioData.skills);
  const updateField = usePortfolioStore((s) => s.updateField);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      updateField("skills", [...skills, trimmed]);
      setNewSkill("");
    }
  }, [newSkill, skills, updateField]);

  const removeSkill = useCallback(
    (index: number) => {
      updateField(
        "skills",
        skills.filter((_, i) => i !== index)
      );
    },
    [skills, updateField]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addSkill();
          }}
          placeholder="Add a skill..."
          className="h-8 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="h-8"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, index) => (
            <Badge
              key={`${skill}-${index}`}
              variant="secondary"
              className="gap-1 pr-1 text-xs"
            >
              {skill}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(index);
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/10 transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEditor({ index }: { index: number }) {
  const project = usePortfolioStore(
    (s) => s.portfolioData.projects[index]
  );
  const updateProject = usePortfolioStore((s) => s.updateProject);
  const removeProject = usePortfolioStore((s) => s.removeProject);
  const [techInput, setTechInput] = useState("");

  if (!project) return null;

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !project.tech.includes(trimmed)) {
      updateProject(index, "tech", [...project.tech, trimmed]);
      setTechInput("");
    }
  };

  const removeTech = (techIndex: number) => {
    updateProject(
      index,
      "tech",
      project.tech.filter((_, i) => i !== techIndex)
    );
  };

  return (
    <Card className="relative group">
      <button
        onClick={() => removeProject(index)}
        className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
        aria-label="Remove project"
      >
        <Trash2 className="size-3.5" />
      </button>
      <CardHeader className="pb-3 pr-8">
        <EditableField
          label="Project Title"
          value={project.title}
          onChange={(val) => updateProject(index, "title", val)}
          placeholder="Project name..."
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <EditableField
          label="Description"
          value={project.description}
          onChange={(val) => updateProject(index, "description", val)}
          multiline
          placeholder="What does this project do?"
        />
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
            Technologies
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.tech.map((tech, i) => (
              <Badge
                key={`${tech}-${i}`}
                variant="secondary"
                className="gap-1 pr-1 font-mono text-xs"
              >
                {tech}
                <button
                  onClick={() => removeTech(i)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/10 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTech();
              }}
              placeholder="Add technology..."
              className="h-7 text-xs"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={addTech}
              disabled={!techInput.trim()}
              className="h-7 px-2"
            >
              <Plus className="size-3" />
            </Button>
          </div>
        </div>
        <EditableField
          label="Impact"
          value={project.impact}
          onChange={(val) => updateProject(index, "impact", val)}
          placeholder="Quantified results..."
        />
      </CardContent>
    </Card>
  );
}

function ContactEditor() {
  const contact = usePortfolioStore((s) => s.portfolioData.contact);
  const updateContact = usePortfolioStore((s) => s.updateContact);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-2">
        <Mail className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <EditableField
            label="Email"
            value={contact.email}
            onChange={(val) => updateContact("email", val)}
            placeholder="email@example.com"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <EditableField
            label="Phone"
            value={contact.phone}
            onChange={(val) => updateContact("phone", val)}
            placeholder="+1-XXX-XXX-XXXX"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Linkedin className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <EditableField
            label="LinkedIn"
            value={contact.linkedin}
            onChange={(val) => updateContact("linkedin", val)}
            placeholder="linkedin.com/in/username"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Github className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <EditableField
            label="GitHub"
            value={contact.github}
            onChange={(val) => updateContact("github", val)}
            placeholder="github.com/username"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Globe className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <EditableField
            label="Website"
            value={contact.website}
            onChange={(val) => updateContact("website", val)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Preview Mode ──────────────────── */

function PortfolioPreview() {
  const data = usePortfolioStore((s) => s.portfolioData);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <header className="text-center space-y-2 py-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {data.name || "Your Name"}
        </h1>
        <p className="text-primary font-medium">{data.title || "Title"}</p>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          {data.hero || "Your professional headline..."}
        </p>
      </header>

      <Separator />

      {/* About */}
      {data.about && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            About
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {data.about}
          </p>
        </section>
      )}

      <Separator />

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill, i) => (
              <Badge
                key={`${skill}-${i}`}
                variant="secondary"
                className="text-xs"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Projects
          </h2>
          <div className="grid gap-4">
            {data.projects.map((project, i) => (
              <Card key={i} className="p-5">
                <h3 className="font-bold text-sm mb-1.5">{project.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {project.description}
                </p>
                {project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.tech.map((t, j) => (
                      <Badge
                        key={j}
                        variant="outline"
                        className="font-mono text-[10px] px-1.5 py-0"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {project.impact && (
                  <p className="text-xs italic text-muted-foreground">
                    <span className="font-semibold not-italic">Impact:</span>{" "}
                    {project.impact}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Contact */}
      {(data.contact.email ||
        data.contact.phone ||
        data.contact.linkedin ||
        data.contact.github ||
        data.contact.website) && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Contact
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {data.contact.email && (
              <a
                href={`mailto:${data.contact.email}`}
                className="text-primary hover:underline"
              >
                {data.contact.email}
              </a>
            )}
            {data.contact.phone && (
              <span className="text-muted-foreground">
                {data.contact.phone}
              </span>
            )}
            {data.contact.linkedin && (
              <a
                href={`https://${data.contact.linkedin.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                LinkedIn
              </a>
            )}
            {data.contact.github && (
              <a
                href={`https://${data.contact.github.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </a>
            )}
            {data.contact.website && (
              <a
                href={data.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Website
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ──────────────────── Main Editor ──────────────────── */

export function PortfolioEditor() {
  const portfolioData = usePortfolioStore((s) => s.portfolioData);
  const updateField = usePortfolioStore((s) => s.updateField);
  const addProject = usePortfolioStore((s) => s.addProject);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border p-0.5">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pencil className="size-3" />
            Edit
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3" />
            Preview
          </button>
        </div>
      </div>

      {viewMode === "preview" ? (
        <PortfolioPreview />
      ) : (
        <div className="space-y-8">
          {/* Hero Fields */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Hero Section
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <EditableField
                label="Full Name"
                value={portfolioData.name}
                onChange={(val) => updateField("name", val)}
                placeholder="John Doe"
              />
              <EditableField
                label="Professional Title"
                value={portfolioData.title}
                onChange={(val) => updateField("title", val)}
                placeholder="Full-Stack Developer"
              />
            </div>
            <EditableField
              label="Hero Tagline"
              value={portfolioData.hero}
              onChange={(val) => updateField("hero", val)}
              multiline
              placeholder="A compelling one-liner about you..."
            />
          </section>

          <Separator />

          {/* About */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              About
            </h2>
            <EditableField
              label="Professional Summary"
              value={portfolioData.about}
              onChange={(val) => updateField("about", val)}
              multiline
              placeholder="Tell your professional story in 3-4 sentences..."
            />
          </section>

          <Separator />

          {/* Skills */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Skills
            </h2>
            <SkillEditor />
          </section>

          <Separator />

          {/* Projects */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Projects
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={addProject}
                className="h-7 text-xs gap-1"
              >
                <Plus className="size-3" />
                Add Project
              </Button>
            </div>
            <div className="space-y-4">
              <ProjectList />
            </div>
          </section>

          <Separator />

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contact
            </h2>
            <ContactEditor />
          </section>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Project List Wrapper ──────────────────── */

function ProjectList() {
  const projects = usePortfolioStore((s) => s.portfolioData.projects);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <p className="text-sm">No projects yet.</p>
        <p className="text-xs mt-1">
          Click &quot;Add Project&quot; to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((_, index) => (
        <ProjectEditor key={index} index={index} />
      ))}
    </div>
  );
}
