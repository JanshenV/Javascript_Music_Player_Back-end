import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

//Model
import User from 'App/Models/User';

//Validators
import CreateUserValidator from 'App/Validators/CreateUserValidator';


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
            await request.validate(CreateUserValidator);

            const existingEmail = await User.findBy('email', email);
            if (existingEmail) return response.badRequest({
                message: 'Email already in use.'
            });

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
