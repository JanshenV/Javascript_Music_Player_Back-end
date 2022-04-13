import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

//Validator
import UserLoginValidator from 'App/Validators/UserLoginValidator';
export default class LoginController {
    public async login({ request, response, auth }: HttpContextContract) {
        const { email, password } = request.body();

        try {
            await request.validate(UserLoginValidator);

            const token = await auth.use('api').attempt(email, password, {
                expiresIn: '1m'
            });

            return response.status(200).json({
                token
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };
};
