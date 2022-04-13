import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

//Model
import User from 'App/Models/User';

export default class LoginController {
    public async login({ request, response, auth }: HttpContextContract) {
        const { email, password } = request.body();

        try {
            const token = await auth.use('api').attempt(email, password);

            return token
        } catch (error) {
            return response.badRequest(error);
        };
    };
}
