import { atom } from 'jotai';

// Define categories and their active card counts
export const activeCardsAtom = atom<{
  [columnId: string]: number;
}>({});
