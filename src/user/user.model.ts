import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../enums/role.enum';

export type UserModelDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true })
export class UserModel {
  @Prop({ unique: true })
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  name: string;

  @Prop({ unique: true })
  phone: string;

  @Prop({ type: String, enum: Role })
  role: Role;
}

export const UserModelSchema = SchemaFactory.createForClass(UserModel);
