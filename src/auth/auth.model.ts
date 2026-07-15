import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../enums/role.enum';

export type AuthModelDocument = HydratedDocument<AuthModel>;

export class AuthModel {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop({ type: String, enum: Role })
  role: Role;
}

export const AuthModelSchema = SchemaFactory.createForClass(AuthModel);
