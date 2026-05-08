export type SquadMember = {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  added_at: string;
};

export type Squad = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  avatar_signed_url: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type SquadDetail = Squad & {
  members: SquadMember[];
};

export type SquadList = {
  squads: Squad[];
  total: number;
};
