import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	@MinLength(6, {
		message: 'Password cannot be less than 6 characters!'
	})
	@IsString()
	password: string
}
