export type ResourceStatus = "pending" | "approved";

export type Category =
  | "Frontend"
  | "Backend"
  | "Fullstack"
  | "DevOps"
  | "Design"
  | "Tools"
  | "Learning";

export type Subcategory = {
  Frontend:
    | "Motion"
    | "State Management"
    | "Styling"
    | "UI Libraries"
    | "Forms";
  Backend: "APIs" | "Databases" | "Authentication" | "Serverless" | "ORMs";
  Fullstack: "Frameworks" | "Boilerplates" | "CMS" | "Hosting";
  DevOps: "CI/CD" | "Containers" | "Monitoring" | "Cloud" | "Version Control";
  Design: "Prototyping" | "Icons" | "Colors" | "Fonts" | "Illustrations";
  Tools: "Editors" | "Extensions" | "CLI" | "Package Managers" | "Testing";
  Learning: "Documentation" | "Tutorials" | "Courses" | "Books" | "Blogs";
};

export interface Resource {
  id: string;
  name: string;
  category: Category;
  subcategory: string | null;
  description: string;
  url: string;
  tags: string[];
  status: ResourceStatus;
  created_at: string;
  image_url: string | null;
}

export interface Database {
  public: {
    Tables: {
      resources: {
        Row: Resource;
        Insert: Omit<Resource, "id" | "created_at">;
        Update: Partial<Omit<Resource, "id" | "created_at">>;
      };
    };
  };
}
