import type { UserDTO } from "@/infrastructure/dtos/User/UserDTO";
import type { User } from "../../domain/models/User/User";
import type { UpdateUserRequest } from "../../domain/models/User/UpdateUserRequest";
import type { UpdateUserRequestDTO } from "../dtos/User/UpdateUserRequestDTO";
import type { ChangePassword } from "@/domain/models/User/ChangePassword";
import type { ChangePasswordDTO } from "../dtos/User/ChangePasswordDTO";

export const mapUser = (dto: UserDTO): User => ({
  id: dto.id,
  name: dto.name,
  surname: dto.surname,
  email: dto.email,
  role: dto.role,
  isActive: dto.is_active,
});

export const mapUpdateUserRequest = (request: UpdateUserRequest): UpdateUserRequestDTO => ({
  name: request.name,
  surname: request.surname,
  email: request.email,
  is_active: request.isActive,
  role: request.role,
});

export const mapChangePassword = (request: ChangePassword): ChangePasswordDTO => ({
  current_password: request.currentPassword,
  new_password: request.newPassword
})