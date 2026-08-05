import api from "./axios";

export interface Role {
  _id: string;
  roleName: string;
 description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  roleName: string;
  description: string;
  status: string;
}

interface GetRolesResponse {
  success: boolean;
  total: number;
  roles: Role[];
}

interface CreateRoleResponse {
  success: boolean;
  message: string;
  role: Role;
}

export async function getRoles(): Promise<Role[]> {
  const { data } =
    await api.get<GetRolesResponse>("/admin/roles");

  return data.roles;
}

export async function createRole(
  payload: CreateRolePayload,
): Promise<Role> {
  const { data } =
    await api.post<CreateRoleResponse>(
      "/admin/roles",
      payload,
    );

  return data.role;
}

export async function deleteRole(id: string) {
  return api.delete(`/admin/roles/${id}`);
}