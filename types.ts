
import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Skill {
  name: string;
  icon?: React.ReactNode;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface Project {
  title: string;
  slug: string; // Used to fetch /projects/[slug].md
  category: string; // New field for filtering
  type: string;
  description: string;
  tags: string[];
  achievement?: string;
  link?: string;
  imageUrl?: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface AcademicWork {
  title: string;
  description: string;
  tags: string[];
}

export interface Award {
  year: string;
  title: string;
  organization: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  slug: string; 
  title: string;
  category: string; // New field for filtering
  date: string;
  tags: string[];
  excerpt: string;
  coverImage?: string; // Added for preview images
}
