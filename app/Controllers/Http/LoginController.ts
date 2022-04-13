import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
export default class LoginController {
    public async login({ request, response, auth }: HttpContextContract) {
        const { email, password } = request.body();

        try {
            const token = await auth.use('api').attempt(email, password);

            return response.status(200).json({
                token
            });
        } catch (error) {
            return response.badRequest(error);
        };
    };
};
