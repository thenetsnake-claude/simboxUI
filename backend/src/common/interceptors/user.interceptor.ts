import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.auth && request.auth.payload) {
      const { sub: auth0Id, email, name } = request.auth.payload;

      // Extract role from custom claim
      const role = request.auth.payload.role || request.auth.payload['https://your-app/role'] || UserRole.SUPPORT;

      // Find or create user
      let user = await this.userRepository.findOne({ where: { auth0_id: auth0Id } });

      if (!user) {
        user = this.userRepository.create({
          auth0_id: auth0Id,
          email,
          name,
          role,
        });
        await this.userRepository.save(user);
      } else if (user.email !== email || user.name !== name || user.role !== role) {
        // Update user info if changed
        user.email = email;
        user.name = name;
        user.role = role;
        await this.userRepository.save(user);
      }

      request.user = user;
    }

    return next.handle();
  }
}
