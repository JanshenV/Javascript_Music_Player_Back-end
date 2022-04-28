import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

import User from 'App/Models/User';
import VerifyEmailToken from 'App/Models/VerifyEmailToken';


//Validator
import UserLoginValidator from 'App/Validators/UserLoginValidator';
export default class LoginController {
    public async login({ request, response, auth }: HttpContextContract) {
        const { email, password } = request.body();

        try {
            await request.validate(UserLoginValidator);

            const user = await User.findBy('email', email);
            if (!user || !user.verified) {
                return response.badRequest({
                    message: 'User not found or email has not been verified.'
                });
            };

            const token = await auth.use('api').attempt(email, password, {
                expiresIn: '8h'
            });


            return response.status(200).json({
                token
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async verifyEmail({ params, response }: HttpContextContract) {
        const { token } = params;

        try {
            const userToken = await VerifyEmailToken
                .query()
                .where({ token })
                .first();

            if (!userToken) return response.badRequest({
                message: 'Bad link. You should be looking for Zelda in another castle.'
            });

            const user = await User.findBy('id', userToken?.user_id);

            user!.verified = true;
            await user?.save();
            await userToken?.delete();

            return response.accepted({
                message: 'Email verified.'
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };
};
