export type NotesSection = {
  heading?: string;
  level?: 1 | 2 | 3;
  content: string;
};

export type NotesDocument = {
  title?: string;
  language?: string;
  sections: NotesSection[];
};
