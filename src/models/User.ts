import mongoos, {Schema, Document} from "mongoose";

export interface Users extends Document {
    username: string,
    email: string,
    password: string,
    role: string,
    gender: string,
    nohp: bigint,
    alamat: string,
}

const userSchema: Schema = new  Schema({
    username: {type:String, require: true},
    email: {type:String, require: true, unique: true},
    password: {type:String, require: true},
    role: {type:String, require: true, default: 'user'},
    gender: {type: String, require: true},
    nohp: {type: Number, require: true},
    alamat: {type: String, require: true},
})

export const User = mongoos.model<Users>('User', userSchema)