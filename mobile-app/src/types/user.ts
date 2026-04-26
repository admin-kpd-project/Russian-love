/** Как web/app/types.ts — для избранного */
export interface User {
  id: string;
  name: string;
  age: number;
  location?: string;
  job?: string;
  education?: string;
  bio: string;
  photos: string[];
  interests: string[];
  online?: boolean;
}
