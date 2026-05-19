// import { User } from './user';

// export interface Job {
//   id?: number;
//   title: string;
//   description: string;
//   budget: number;
//   status: string;
//   client?: User;
// }

import { User } from './user';

export interface Job {
  id?: number;
  title?: string;
  description?: string;
  budget?: number;
  skills?: string;
  deadline?: string;
  status?: string;
  client?: User;
}