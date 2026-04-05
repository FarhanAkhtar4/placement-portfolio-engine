"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  X,
  ArrowRight,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { defaultPortfolioData } from "@/types/portfolio";
import type { Project, ContactInfo } from "@/types/portfolio";

function ContactInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground shrink-0 mt-1.5" />
      <div className="flex-1 space-y-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}

export function ManualEntryStep() {
  const setPortfolioData = usePortfolioStore((s) => s.setPortfolioData);
  const setCurrentStep = usePortfolioStore((s) => s.setCurrentStep);

  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [hero, setHero] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { title: "", description: "", tech: [], impact: "" },
  ]);
  const [contact, setContact] = useState<ContactInfo>({
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    website: "",
  });

  // Skill input
  const [newSkill, setNewSkill] = useState("");

  const addSkill = useCallback(() => {
    const t = newSkill.trim().toLowerCase();
    if (t && !skills.includes(t)) {
      setSkills((s) => [...s, t]);
      setNewSkill("");
    }
  }, [newSkill, skills]);

  const removeSkill = useCallback((i: number) => {
    setSkills((s) => s.filter((_, idx) => idx !== i));
  }, []);

  // Project management
  const addProjectField = useCallback(() => {
    setProjects((p) => [...p, { title: "", description: "", tech: [], impact: "" }]);
  }, []);

  const removeProjectField = useCallback((i: number) => {
    setProjects((p) => p.filter((_, idx) => idx !== i));
  }, []);

  const updateProjectField = useCallback(
    (i: number, field: keyof Project, value: string | string[]) => {
      setProjects((p) => {
        const copy = [...p];
        copy[i] = { ...copy[i], [field]: value };
        return copy;
      });
    },
    []
  );

  // Tech input per project
  const [techInputs, setTechInputs] = useState<Record<number, string>>({});

  const addTechToProject = useCallback(
    (projIndex: number) => {
      const t = techInputs[projIndex]?.trim();
      if (t) {
        const proj = projects[projIndex];
        if (proj && !proj.tech.includes(t)) {
          updateProjectField(projIndex, "tech", [...proj.tech, t]);
          setTechInputs((prev) => ({ ...prev, [projIndex]: "" }));
        }
      }
    },
    [techInputs, projects, updateProjectField]
  );

  const removeTechFromProject = useCallback(
    (projIndex: number, techIndex: number) => {
      const proj = projects[projIndex];
      if (proj) {
        updateProjectField(
          projIndex,
          "tech",
          proj.tech.filter((_, i) => i !== techIndex)
        );
      }
    },
    [projects, updateProjectField]
  );

  const handleSubmit = useCallback(() => {
    setPortfolioData({
      name: name.trim() || "Your Name",
      title: title.trim() || "Software Engineer",
      hero:
        hero.trim() ||
        "Passionate developer building impactful solutions.",
      about:
        about.trim() ||
        "A dedicated software engineering professional with a passion for building innovative applications.",
      skills,
      projects: projects.filter((p) => p.title.trim()),
      contact,
    });
    setCurrentStep("edit");
  }, [name, title, hero, about, skills, projects, contact, setPortfolioData, setCurrentStep]);

  const isValid =
    name.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Enter Your Details
        </h2>
        <p className="text-muted-foreground text-sm">
          Fill in your information below to create a portfolio. You can always
          edit later.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Professional Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Full-Stack Developer | CS Student"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Hero Tagline
              </label>
              <Textarea
                value={hero}
                onChange={(e) => setHero(e.target.value)}
                placeholder="A compelling 1-2 sentence headline about you..."
                className="min-h-[60px] resize-y text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                About
              </label>
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell your professional story in 3-4 sentences..."
                className="min-h-[80px] resize-y text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="h-8 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addSkill}
                disabled={!newSkill.trim()}
                className="h-8 shrink-0"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <Badge
                    key={`${skill}-${i}`}
                    variant="secondary"
                    className="gap-1 pr-1 text-xs"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(i)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/10"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Projects</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addProjectField}
                className="h-7 text-xs gap-1"
              >
                <Plus className="size-3" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((proj, pIdx) => (
              <div
                key={pIdx}
                className="relative rounded-lg border p-3 space-y-2"
              >
                {projects.length > 1 && (
                  <button
                    onClick={() => removeProjectField(pIdx)}
                    className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground/60 hover:text-destructive transition-colors"
                    aria-label="Remove project"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Title
                    </label>
                    <Input
                      value={proj.title}
                      onChange={(e) =>
                        updateProjectField(pIdx, "title", e.target.value)
                      }
                      placeholder="Project name"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Impact
                    </label>
                    <Input
                      value={proj.impact}
                      onChange={(e) =>
                        updateProjectField(pIdx, "impact", e.target.value)
                      }
                      placeholder="Reduced load time by 40%"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    value={proj.description}
                    onChange={(e) =>
                      updateProjectField(pIdx, "description", e.target.value)
                    }
                    placeholder="What does this project do?"
                    className="min-h-[50px] resize-y text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Technologies
                  </label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {proj.tech.map((t, tIdx) => (
                      <Badge
                        key={tIdx}
                        variant="outline"
                        className="gap-0.5 pr-1 font-mono text-[10px]"
                      >
                        {t}
                        <button
                          onClick={() => removeTechFromProject(pIdx, tIdx)}
                          className="rounded-full p-0.5 hover:bg-muted-foreground/10"
                        >
                          <X className="size-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      value={techInputs[pIdx] || ""}
                      onChange={(e) =>
                        setTechInputs((prev) => ({
                          ...prev,
                          [pIdx]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTechToProject(pIdx);
                        }
                      }}
                      placeholder="Add tech..."
                      className="h-7 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTechToProject(pIdx)}
                      disabled={
                        !(techInputs[pIdx] || "").trim()
                      }
                      className="h-7 px-2"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ContactInput
                label="Email"
                icon={Mail}
                value={contact.email}
                onChange={(v) =>
                  setContact((c) => ({ ...c, email: v }))
                }
                placeholder="email@example.com"
              />
              <ContactInput
                label="Phone"
                icon={Phone}
                value={contact.phone}
                onChange={(v) =>
                  setContact((c) => ({ ...c, phone: v }))
                }
                placeholder="+1-XXX-XXX-XXXX"
              />
              <ContactInput
                label="LinkedIn"
                icon={Linkedin}
                value={contact.linkedin}
                onChange={(v) =>
                  setContact((c) => ({ ...c, linkedin: v }))
                }
                placeholder="linkedin.com/in/username"
              />
              <ContactInput
                label="GitHub"
                icon={Github}
                value={contact.github}
                onChange={(v) =>
                  setContact((c) => ({ ...c, github: v }))
                }
                placeholder="github.com/username"
              />
              <div className="sm:col-span-2">
                <ContactInput
                  label="Website"
                  icon={Globe}
                  value={contact.website}
                  onChange={(v) =>
                    setContact((c) => ({ ...c, website: v }))
                  }
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-center pt-2 pb-4">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!isValid}
            className="gap-2 px-8"
          >
            Create Portfolio
            <ArrowRight className="size-4" />
          </Button>
        </div>
        {!isValid && (
          <p className="text-center text-xs text-muted-foreground pb-2">
            Enter your name to continue.
          </p>
        )}
      </div>
    </div>
  );
}
