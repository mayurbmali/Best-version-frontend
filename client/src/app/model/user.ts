// export type Role = 'ADMIN' | 'CLIENT' | 'FREELANCER';

// export interface User {
//   id?: number;
//   username: string;
//   password?: string;
//   email: string;
//   contactNumber?: number;
//   skills?: string;
//   bio?: string;
//   role: Role;
// }

export type Role = 'ADMIN' | 'CLIENT' | 'FREELANCER';

export interface User {
  id?: number;
  username: string;
  name?: string;
  password?: string;
  email: string;
  contactNumber?: number;
  skills?: string;
  bio?: string;
  role: Role | string;
}

