import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

//Model
import User from 'App/Models/User';

//Validators
import CreateUserValidator from 'App/Validators/CreateUserValidator';
import UpdateUserValidator from 'App/Validators/UpdateUserValidator';

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

    public async show({ params, response }: HttpContextContract) {
        const { id } = params;

        try {
            const user = await User.findBy('id', id);
            if (!user) return response.badRequest({
                message: 'User not found.'
            });

            return { user };

        } catch (error) {
            return response.badRequest(error);
        };
    };

    public async update({ params, request, response }: HttpContextContract) {
        const { username, email, password } = request.body();
        const { id } = params;

        try {
            if (!id) return response.badRequest({
                message: 'User not found.'
            });

            const user = await User.findBy('id', id);
            if (!user) return response.badRequest({
                message: 'User not found.'
            });

            if (username) {
                await request.validate(UpdateUserValidator);
                user.username = username;
            };

            if (email && email !== user.email) {
                await request.validate(UpdateUserValidator);
                const existingEmail = await User.findBy('email', email);
                if (existingEmail) return response.badRequest({
                    message: 'Email already in use.'
                });
                user.email = email.toLowerCase();
            };

            if (password) {
                await request.validate(UpdateUserValidator);
                user.password = password;
            };

            await user.save();

            const userUpdated = {
                username: user.username,
                email: user.email
            };

            return response.status(200).json({
                message: 'User updated successfully',
                user: userUpdated
            });

        } catch (error) {
            return response.badRequest(error);
        };
    };
}
};
