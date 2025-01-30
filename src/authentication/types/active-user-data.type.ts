import { Roles } from '../../users/enums';

export type ActiveUserData = {
  sub: number;
  email: string;
  name: string;
  role: Roles;
};
