import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { user_role } from "generated/prisma/enums";


export class RegisterDto {
    
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    
    @IsNotEmpty()
    @IsStrongPassword()
    password!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsEnum(user_role)
    @IsOptional()
    role?: user_role;
};