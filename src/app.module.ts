import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { UserModule } from './user/user.module'
import { VideoModule } from './video/video.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		AuthModule,
		DatabaseModule,
		UserModule,
		VideoModule
	]
})
export class AppModule {}
