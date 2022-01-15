import { JwtPayload } from 'jsonwebtoken';

export interface Token extends JwtPayload {
    type: string;
    username: string;
}
