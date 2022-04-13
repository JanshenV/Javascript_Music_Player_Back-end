import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
export default class UsersController {
    public async index({ response }: HttpContextContract) {
        try {
            const allUsers = await User.all();

            return { allUsers }
        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async store({ request, response }: HttpContextContract) {
        const { username, email, password } = request.body();

        try {


            await User.create({
                username,
                email,
                password
            });

            return response.status(201).json({
                message: 'User created.'
            });

        } catch (error) {
            return response.badRequest(error);
        };
    };
};
