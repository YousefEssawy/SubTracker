import type { ISOString } from "./common";

/** A named financial space for grouping transactions */
export interface Space {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: ISOString;
}

/** Payload for creating a new space. Server-generated fields excluded. */
export type SpaceInput = Omit<Space, "id" | "createdAt">;

/** Payload for updating an existing space. All fields optional. */
export type SpaceUpdate = Partial<SpaceInput>;
