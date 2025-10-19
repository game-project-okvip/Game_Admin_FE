export interface Permission {
  [module: string]: {
    GET: boolean;
    POST: boolean;
    PATCH: boolean;
    DELETE: boolean;
  };
}

export interface UserRole {
  _id: string;
  role: string;
  isSuperAdmin: boolean;
  permission: Permission;
}