import { ForbiddenException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import * as argon from 'argon2'
import { PrismaService } from '../database/prisma.service'
import { AuthDto } from './dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService
	) {}

	async signup(dto: AuthDto) {
		try {
			const hash = await argon.hash(dto.password)
			const user = await this.prismaService.user.create({
				data: {
					email: dto.email,
					hash
				}
			})

			return this.signToken(user.id, user.email)
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Credential taken')
				}
			}

			throw error
		}
	}

	async signin(dto: AuthDto) {
		try {
			// find the user by email
			const user = await this.prismaService.user.findUnique({
				where: {
					email: dto.email
				}
			})

			if (!user) {
				throw new ForbiddenException('Incorrect email or password')
			}

			// check password
			const isPwMatch = await argon.verify(user.hash, dto.password)

			if (!isPwMatch) {
				throw new ForbiddenException('Incorrect email or password')
			}

			return this.signToken(user.id, user.email)
		} catch (error) {}
	}

	async signToken(
		userId: number,
		email: string
	): Promise<{ access_token: string }> {
		const payload = {
			id: userId,
			email
		}

		const token = await this.jwtService.signAsync(payload, {
			secret: this.configService.get('JWT_SECRET'),
			expiresIn: '30d'
		})

		return { access_token: token }
	}
}
